import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { Shift } from '../../../entities/shift.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { applyWithdrawnDebitFifo } from '../../../common/utils/apply-withdrawn-operations';
import { WithdrawCashV2Dto } from './withdraw-cash-v2.dto';
import { WithdrawCashV2ResponseDto } from './withdraw-cash-v2.response.dto';

@Injectable()
export class WithdrawCashV2Service {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: WithdrawCashV2Dto, userId: number): Promise<WithdrawCashV2ResponseDto> {
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

      const withdrawalRate = Number(dto.withdrawalRate);
      if (!Number.isFinite(withdrawalRate) || withdrawalRate <= 0) {
        throw new BadRequestException('Invalid exchange rate. Please enter a positive number.');
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

      return new WithdrawCashV2ResponseDto(savedWithdrawal);
    });
  }
}
