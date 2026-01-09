import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { Shift } from '../../../entities/shift.entity';
import { Platform } from '../../../entities/platform.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { WithdrawCashDto } from './withdraw-cash.dto';
import { WithdrawCashResponseDto } from './withdraw-cash.response.dto';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';
import { applyWithdrawnDebitFifo } from '../../../common/utils/apply-withdrawn-operations';

@Injectable()
export class WithdrawCashService {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: WithdrawCashDto, userId: number): Promise<WithdrawCashResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const bankAccountRepository = manager.getRepository(BankAccount);
      const shiftRepository = manager.getRepository(Shift);
      const cashWithdrawalRepository = manager.getRepository(CashWithdrawal);
      const withdrawnOpRepository = manager.getRepository(BankAccountWithdrawnOperation);

      const bankAccount = await bankAccountRepository.findOne({
        where: { id: dto.bankAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!bankAccount) {
        throw new NotFoundException(`Bank account with ID ${dto.bankAccountId} not found`);
      }

      const activeShift = await shiftRepository.findOne({
        where: {
          userId: userId,
          endTime: IsNull(),
        },
        relations: ['platform'],
      });

      if (!activeShift) {
        throw new BadRequestException('No active shift found. Please start a shift first.');
      }

      if (!activeShift.platform) {
        throw new BadRequestException('Platform not found for active shift.');
      }

      const withdrawalRate = Number(activeShift.platform.exchangeRate);
      if (!Number.isFinite(withdrawalRate) || withdrawalRate <= 0) {
        throw new BadRequestException('Invalid exchange rate for the platform.');
      }

      if (Number(bankAccount.withdrawnAmount) < dto.amountPesos) {
        throw new BadRequestException(
          `Insufficient funds. Available: ${bankAccount.withdrawnAmount} ARS, requested: ${dto.amountPesos} ARS`,
        );
      }

      const withdrawal = cashWithdrawalRepository.create({
        amountPesos: dto.amountPesos,
        bankAccountId: dto.bankAccountId,
        withdrawalRate: withdrawalRate,
        status: CashWithdrawalStatus.PENDING,
        withdrawnByUserId: userId,
        comment: dto.comment,
      });

      const savedWithdrawal = await cashWithdrawalRepository.save(withdrawal);

      bankAccount.withdrawnAmount = Number(bankAccount.withdrawnAmount) - Number(dto.amountPesos);
      await bankAccountRepository.save(bankAccount);

      const debitOp = withdrawnOpRepository.create({
        bankAccountId: bankAccount.id,
        type: BankAccountWithdrawnOperationType.DEBIT,
        amountPesos: String(dto.amountPesos),
        remainingPesos: '0',
        platformId: activeShift.platform.id,
        platformRate: String(withdrawalRate),
        cashWithdrawalId: savedWithdrawal.id,
        createdByUserId: userId,
      });
      await withdrawnOpRepository.save(debitOp);

      await applyWithdrawnDebitFifo({
        manager,
        bankAccountId: bankAccount.id,
        amountPesos: Number(dto.amountPesos),
      });

      return new WithdrawCashResponseDto(savedWithdrawal);
    });
  }
}
