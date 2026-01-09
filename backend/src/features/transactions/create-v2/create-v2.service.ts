import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

import { CreateTransactionV2RequestDto } from './create-v2.request.dto';
import { CreateTransactionV2ResponseDto } from './create-v2.response.dto';

@Injectable()
export class CreateTransactionV2Service {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreateTransactionV2RequestDto, user: User): Promise<CreateTransactionV2ResponseDto> {
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

    // IMPORTANT: neo-bank must belong to the same platform as the active shift
    if (Number(sourceNeoBank.platformId) !== Number(activeShift.platform.id)) {
      throw new BadRequestException('Source neo-bank does not belong to current shift platform');
    }

    const arsAmount = Number(dto.amount);
    const usdtDelta = arsAmount / platformRate;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bankAccount = await queryRunner.manager.findOne(BankAccount, {
        where: { id: dto.bankAccountId },
        relations: ['bank', 'drop'],
      });

      if (!bankAccount) {
        throw new NotFoundException('Bank account not found');
      }

      if (bankAccount.status !== BankAccountStatus.WORKING) {
        throw new BadRequestException('Bank account is not available');
      }

      // Optional consistency check: source neo-bank and bank account must be owned by same drop
      if (bankAccount.dropId && sourceNeoBank.dropId && Number(bankAccount.dropId) !== Number(sourceNeoBank.dropId)) {
        throw new BadRequestException('Source neo-bank does not belong to the same drop as bank account');
      }

      const availableLimit = Number(bankAccount.currentLimitAmount);
      if (!Number.isFinite(availableLimit) || availableLimit < arsAmount) {
        throw new BadRequestException(
          `Insufficient limit in bank account. Available: ${availableLimit} ARS, Required: ${arsAmount} ARS`,
        );
      }

      // Lock platform row for update-like behavior by reloading inside transaction
      const platform = await queryRunner.manager.findOne(Platform, {
        where: { id: activeShift.platform.id },
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

      // Create transaction (COMPLETED) using platform rate
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

      // Increase current ARS on bank account (requisite)
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

      // Platform balance decreases by USDT delta
      platform.balance = Number(platform.balance) - usdtDelta;
      await queryRunner.manager.save(platform);

      // Neo-bank pass-through for history: simulate incoming from platform and immediate outgoing to bank.
      // We store balanceBefore/balanceAfter as snapshots. We do NOT require that neo-bank had funds.
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

      // Shift stats
      shift.operationsCount += 1;
      shift.totalAmount = Number(shift.totalAmount) + arsAmount;
      await queryRunner.manager.save(shift);

      await queryRunner.commitTransaction();

      const savedTransaction = await this.transactionRepository.findOne({
        where: { id: transaction.id },
        relations: ['platform', 'shift', 'bankAccount', 'sourceDropNeoBank'],
      });

      return new CreateTransactionV2ResponseDto(savedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
