import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { Shift } from '../../../entities/shift.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { NeoBankWithdrawal } from '../../../entities/neo-bank-withdrawal.entity';
import { Platform } from '../../../entities/platform.entity';
import { User } from '../../../entities/user.entity';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';

import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

import { CreateTransactionV4RequestDto } from './create-v4.request.dto';
import { CreateTransactionV4ResponseDto } from './create-v4.response.dto';

const isPgLockTimeout = (error: unknown) => {
  const anyErr = error as any;
  // Postgres: lock_not_available (55P03) / lock_timeout (55P03/57014 depending on setting)
  const code = anyErr?.code;
  return code === '55P03' || code === '57014';
};

@Injectable()
export class CreateTransactionV4Service {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreateTransactionV4RequestDto, user: User): Promise<CreateTransactionV4ResponseDto> {
    const activeShift = await this.shiftRepository.findOne({
      where: {
        user: { id: user.id },
        status: ShiftStatus.ACTIVE,
      },
      relations: ['platform'],
    });

    if (!activeShift) {
      throw new BadRequestException('No active shift. Please start shift first');
    }

    const platformRate = Number(activeShift.platform?.exchangeRate);
    if (!Number.isFinite(platformRate) || platformRate <= 0) {
      throw new BadRequestException(`Exchange rate not set for platform ${activeShift.platform?.name ?? ''}`);
    }

    const sourceNeoBank = await this.dropNeoBankRepository.findOne({
      where: { id: dto.sourceDropNeoBankId },
      relations: ['platform', 'drop'],
    });

    if (!sourceNeoBank) {
      throw new NotFoundException('Source neo-bank not found');
    }

    if (sourceNeoBank.status !== NeoBankStatus.ACTIVE) {
      throw new BadRequestException('Source neo-bank is not active');
    }

    if (Number(sourceNeoBank.platformId) !== Number(activeShift.platform.id)) {
      throw new BadRequestException('Source neo-bank does not belong to current shift platform');
    }

    const arsAmount = Number(dto.amount);
    if (!Number.isFinite(arsAmount) || arsAmount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const usdtDelta = arsAmount / platformRate;

    const reservationToken = String(dto.reservationToken || '').trim();
    if (!reservationToken) {
      throw new BadRequestException('reservationToken is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Do not let requests hang indefinitely on locks.
      // We prefer a fast user-facing response: "requisite is being used".
      await queryRunner.query(`SET LOCAL lock_timeout = '3s'`);

      // Validate reservation first (soft lock)
      const reservationRows = await queryRunner.query(
        `
          SELECT bank_account_id
          FROM bank_account_reservations
          WHERE bank_account_id = $1
            AND reserved_by_user_id = $2
            AND reservation_token = $3
            AND released_at IS NULL
            AND expires_at > now()
          FOR UPDATE
        `,
        [dto.bankAccountId, user.id, reservationToken],
      );

      if (!reservationRows || reservationRows.length === 0) {
        throw new ConflictException('Реквизит не зарезервирован или резерв истёк. Получите реквизит заново.');
      }

      // IMPORTANT: do not use relations here.
      // TypeORM will build LEFT JOINs for relations, and Postgres rejects `FOR UPDATE`
      // when applied to the nullable side of an outer join.
      // We only need to lock the bank_accounts row for atomic limit updates.
      const bankAccount = await queryRunner.manager.findOne(BankAccount, {
        where: { id: dto.bankAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!bankAccount) {
        throw new NotFoundException('Bank account not found');
      }

      if (bankAccount.status !== BankAccountStatus.WORKING) {
        throw new BadRequestException('Bank account is not available');
      }

      const availableLimit = Number(bankAccount.currentLimitAmount);
      if (!Number.isFinite(availableLimit) || availableLimit < arsAmount) {
        throw new BadRequestException(
          `Insufficient limit in bank account. Available: ${availableLimit} ARS, Required: ${arsAmount} ARS`,
        );
      }

      const platform = await queryRunner.manager.findOne(Platform, {
        where: { id: activeShift.platform.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!platform) {
        throw new NotFoundException('Platform not found');
      }

      const platformBalance = Number(platform.balance);
      if (!Number.isFinite(platformBalance) || platformBalance < usdtDelta) {
        throw new BadRequestException(
          `Insufficient balance on platform. Available: ${platformBalance} USDT, Required: ${usdtDelta.toFixed(4)} USDT`,
        );
      }

      const shift = await queryRunner.manager.findOne(Shift, {
        where: { id: activeShift.id },
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }

      const transaction = queryRunner.manager.create(Transaction, {
        amount: arsAmount,
        amountUSDT: usdtDelta,
        exchangeRate: platformRate,
        status: TransactionStatus.COMPLETED,
        receipt: dto.receipt,
        comment: dto.comment,
        shift: shift,
        platform: platform,
        bankAccount: bankAccount,
        sourceDropNeoBank: sourceNeoBank,
        user: user,
      });
      await queryRunner.manager.save(transaction);

      bankAccount.withdrawnAmount = Number(bankAccount.withdrawnAmount) + arsAmount;
      bankAccount.currentLimitAmount = Number(bankAccount.currentLimitAmount) - arsAmount;
      bankAccount.lastUsedAt = new Date();

      if (bankAccount.currentLimitAmount <= 0) {
        bankAccount.status = BankAccountStatus.BLOCKED;
        bankAccount.blockReason = 'Достигнут лимит вывода';
      }

      await queryRunner.manager.save(bankAccount);

      const withdrawnOp = queryRunner.manager.create(BankAccountWithdrawnOperation, {
        bankAccountId: bankAccount.id,
        type: BankAccountWithdrawnOperationType.CREDIT,
        amountPesos: String(arsAmount),
        remainingPesos: String(arsAmount),
        platformId: platform.id,
        platformRate: String(platformRate),
        sourceDropNeoBankId: sourceNeoBank.id,
        transactionId: transaction.id,
        createdByUserId: user.id,
      });
      await queryRunner.manager.save(withdrawnOp);

      platform.balance = Number(platform.balance) - usdtDelta;
      await queryRunner.manager.save(platform);

      const baseBalance = Number(sourceNeoBank.currentBalance) || 0;
      const balanceBefore = baseBalance + arsAmount;
      const balanceAfter = baseBalance;

      const neoBankWithdrawal = queryRunner.manager.create(NeoBankWithdrawal, {
        amount: arsAmount,
        neoBank: sourceNeoBank,
        bankAccount: bankAccount,
        transaction: transaction,
        withdrawnByUser: user,
        balanceBefore,
        balanceAfter,
        comment: dto.comment,
      });
      await queryRunner.manager.save(neoBankWithdrawal);

      shift.operationsCount += 1;
      shift.totalAmount = Number(shift.totalAmount) + arsAmount;
      await queryRunner.manager.save(shift);

      await queryRunner.commitTransaction();

      // Release reservation after successful commit (best-effort)
      try {
        await this.dataSource.query(
          `
            UPDATE bank_account_reservations
            SET released_at = now(), expires_at = now()
            WHERE bank_account_id = $1
              AND reserved_by_user_id = $2
              AND reservation_token = $3
              AND released_at IS NULL
          `,
          [dto.bankAccountId, user.id, reservationToken],
        );
      } catch {
        // ignore
      }

      const savedTransaction = await this.transactionRepository.findOne({
        where: { id: transaction.id },
        relations: ['platform', 'shift', 'bankAccount', 'sourceDropNeoBank'],
      });

      return new CreateTransactionV4ResponseDto(savedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (isPgLockTimeout(error)) {
        throw new ConflictException(
          'Реквизит сейчас фиксируется другим оператором. Подождите несколько секунд и попробуйте снова.',
        );
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
