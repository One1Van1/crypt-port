import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { Shift } from '../../../entities/shift.entity';
import { Platform } from '../../../entities/platform.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { WithdrawCashDto } from './withdraw-cash.dto';
import { WithdrawCashResponseDto } from './withdraw-cash.response.dto';

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
  ) {}

  async execute(dto: WithdrawCashDto, userId: number): Promise<WithdrawCashResponseDto> {
    // Проверить существование банковского счёта
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id: dto.bankAccountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${dto.bankAccountId} not found`);
    }

    // Найти активную смену пользователя
    const activeShift = await this.shiftRepository.findOne({
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

    // Получить курс из платформы
    const withdrawalRate = activeShift.platform.exchangeRate;

    if (!withdrawalRate || withdrawalRate <= 0) {
      throw new BadRequestException('Invalid exchange rate for the platform.');
    }

    // Проверить достаточно ли средств на счёте
    if (bankAccount.withdrawnAmount < dto.amountPesos) {
      throw new BadRequestException(
        `Insufficient funds. Available: ${bankAccount.withdrawnAmount} ARS, requested: ${dto.amountPesos} ARS`
      );
    }

    // Создать запись о заборе наличных
    const withdrawal = this.cashWithdrawalRepository.create({
      amountPesos: dto.amountPesos,
      bankAccountId: dto.bankAccountId,
      withdrawalRate: withdrawalRate,
      status: CashWithdrawalStatus.PENDING,
      withdrawnByUserId: userId,
      comment: dto.comment,
    });

    const savedWithdrawal = await this.cashWithdrawalRepository.save(withdrawal);

    // Обновить withdrawnAmount на банковском счёте (уменьшить)
    bankAccount.withdrawnAmount -= dto.amountPesos;
    await this.bankAccountRepository.save(bankAccount);

    return new WithdrawCashResponseDto(savedWithdrawal);
  }
}
