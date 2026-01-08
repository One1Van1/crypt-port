import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { DailyProfit } from '../../../entities/daily-profit.entity';
import { Platform } from '../../../entities/platform.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { Profit } from '../../../entities/profit.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { ConfirmConversionResponseDto } from './confirm-conversion.response.dto';

@Injectable()
export class ConfirmConversionService {
  constructor(
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(DailyProfit)
    private readonly dailyProfitRepository: Repository<DailyProfit>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly pesoToUsdtConversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async execute(id: number): Promise<ConfirmConversionResponseDto> {
    const conversion = await this.conversionRepository.findOne({
      where: { id },
      relations: ['convertedByUser'],
      withDeleted: true,
    });

    if (!conversion) {
      throw new NotFoundException('Conversion not found');
    }

    // Подтверждаем конвертацию
    conversion.status = ConversionStatus.CONFIRMED;
    const updated = await this.conversionRepository.save(conversion);

    // Находим все withdrawals в статусе AWAITING_CONFIRMATION от этого пользователя
    // и помечаем их как CONVERTED
    const awaitingWithdrawals = await this.cashWithdrawalRepository.find({
      where: {
        withdrawnByUserId: conversion.convertedByUserId,
        status: CashWithdrawalStatus.AWAITING_CONFIRMATION,
      },
    });

    // Помечаем как converted
    for (const withdrawal of awaitingWithdrawals) {
      withdrawal.status = CashWithdrawalStatus.CONVERTED;
      await this.cashWithdrawalRepository.save(withdrawal);
    }

    // Обновляем DailyProfit за сегодня
    await this.updateTodayProfit();

    return new ConfirmConversionResponseDto(
      updated.id,
      updated.status,
      updated.usdtAmount,
    );
  }

  private async updateTodayProfit(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Рассчитываем totalUsdt
    const totalUsdt = await this.calculateTotalUsdt();

    // Получаем initialDeposit из настроек
    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    // Profit = totalUsdt - initialDeposit
    const profit = totalUsdt - initialDeposit;

    // Проверяем есть ли запись за сегодня
    let dailyProfit = await this.dailyProfitRepository.findOne({
      where: { date: today as any },
    });

    if (dailyProfit) {
      // Обновляем существующую запись
      dailyProfit.totalUsdt = totalUsdt;
      dailyProfit.initialDeposit = initialDeposit;
      dailyProfit.profit = profit;
      await this.dailyProfitRepository.save(dailyProfit);
    } else {
      // Создаем новую запись
      dailyProfit = this.dailyProfitRepository.create({
        date: today as any,
        totalUsdt,
        initialDeposit,
        profit,
      });
      await this.dailyProfitRepository.save(dailyProfit);
    }
  }

  private async calculateTotalUsdt(): Promise<number> {
    // 1. Platform Balances
    const platforms = await this.platformRepository.find();
    const platformBalances = platforms.reduce((sum, p) => sum + Number(p.balance), 0);

    // 2. Blocked Pesos (frozen neo-banks)
    const frozenNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.FROZEN },
    });
    const blockedPesos = frozenNeoBanks.reduce((sum, nb) => {
      const balance = Number(nb.currentBalance);
      const rate = Number(nb.exchangeRate) || 1100;
      return sum + balance / rate;
    }, 0);

    // 3. Unpaid Pesos (active neo-banks + pending transactions)
    const activeNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.ACTIVE },
    });
    let unpaidPesos = activeNeoBanks.reduce((sum, nb) => {
      const balance = Number(nb.currentBalance);
      const rate = Number(nb.exchangeRate) || 1100;
      return sum + balance / rate;
    }, 0);

    const pendingTransactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
    });
    unpaidPesos += pendingTransactions.reduce((sum, t) => {
      const amount = Number(t.amount);
      const rate = Number(t.exchangeRate) || 1100;
      return sum + amount / rate;
    }, 0);

    // 4. Free USDT (confirmed conversions - withdrawn profits)
    const allConversions = await this.pesoToUsdtConversionRepository.find({
      where: { status: ConversionStatus.CONFIRMED },
    });
    const totalConverted = allConversions.reduce((sum, conv) => sum + Number(conv.usdtAmount), 0);

    const profits = await this.profitRepository.find();
    const totalWithdrawn = profits.reduce((sum, profit) => sum + Number(profit.withdrawnUsdt), 0);

    const freeUsdt = totalConverted - totalWithdrawn;

    // Total = Platform + Blocked + Unpaid + Free
    const totalUsdt = platformBalances + blockedPesos + unpaidPesos + freeUsdt;

    return totalUsdt;
  }
}
