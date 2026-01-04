import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { ExchangeRate } from '../../../entities/exchange-rate.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { WithdrawCashDto } from './withdraw-cash.dto';
import { WithdrawCashResponseDto } from './withdraw-cash.response.dto';

@Injectable()
export class WithdrawCashService {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(dto: WithdrawCashDto, userId: number): Promise<WithdrawCashResponseDto> {
    // Проверить существование банковского счёта
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id: dto.bankAccountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${dto.bankAccountId} not found`);
    }

    // Получить текущий активный курс
    const currentRate = await this.exchangeRateRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!currentRate) {
      throw new BadRequestException('No active exchange rate found. Please set exchange rate first.');
    }

    // Создать запись о заборе наличных
    const withdrawal = this.cashWithdrawalRepository.create({
      amountPesos: dto.amountPesos,
      bankAccountId: dto.bankAccountId,
      withdrawalRate: currentRate.rate,
      status: 'pending',
      withdrawnByUserId: userId,
      comment: dto.comment,
    });

    const savedWithdrawal = await this.cashWithdrawalRepository.save(withdrawal);

    return new WithdrawCashResponseDto(savedWithdrawal);
  }
}
