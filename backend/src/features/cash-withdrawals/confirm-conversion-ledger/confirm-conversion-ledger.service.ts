import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { DailyProfit } from '../../../entities/daily-profit.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { Platform } from '../../../entities/platform.entity';
import { Profit } from '../../../entities/profit.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { User } from '../../../entities/user.entity';
import { ConfirmConversionLedgerResponseDto } from './confirm-conversion-ledger.response.dto';

@Injectable()
export class ConfirmConversionLedgerService {
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
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(FreeUsdtEntry)
    private readonly freeUsdtEntryRepository: Repository<FreeUsdtEntry>,
    @InjectRepository(FreeUsdtDistribution)
    private readonly freeUsdtDistributionRepository: Repository<FreeUsdtDistribution>,
  ) {}

  async execute(id: number, user: User): Promise<ConfirmConversionLedgerResponseDto> {
    const conversion = await this.conversionRepository.findOne({
      where: { id },
      relations: ['convertedByUser'],
    });

    if (!conversion) {
      throw new NotFoundException('Conversion not found');
    }

    if (conversion.status !== ConversionStatus.CONFIRMED) {
      conversion.status = ConversionStatus.CONFIRMED;
      await this.conversionRepository.save(conversion);
    }

    const existingEntry = await this.freeUsdtEntryRepository.findOne({
      where: { conversionId: conversion.id },
    });

    let created = false;

    if (!existingEntry) {
      const entry = this.freeUsdtEntryRepository.create({
        conversionId: conversion.id,
        pesosAmount: conversion.pesosAmount,
        exchangeRate: conversion.exchangeRate,
        usdtAmount: conversion.usdtAmount,
        convertedByUserId: conversion.convertedByUserId,
        confirmedByUserId: user.id,
        confirmedAt: new Date(),
      });

      await this.freeUsdtEntryRepository.save(entry);
      created = true;
    }

    const awaitingWithdrawals = await this.cashWithdrawalRepository.find({
      where: {
        withdrawnByUserId: conversion.convertedByUserId,
        status: CashWithdrawalStatus.AWAITING_CONFIRMATION,
      },
    });

    for (const withdrawal of awaitingWithdrawals) {
      withdrawal.status = CashWithdrawalStatus.CONVERTED;
      await this.cashWithdrawalRepository.save(withdrawal);
    }

    await this.updateTodayProfit();

    return new ConfirmConversionLedgerResponseDto(
      conversion.id,
      conversion.status,
      conversion.usdtAmount,
      created,
    );
  }

  private async updateTodayProfit(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const totalUsdt = await this.calculateTotalUsdt();

    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    const profit = totalUsdt - initialDeposit;

    let dailyProfit = await this.dailyProfitRepository.findOne({
      where: { date: today as any },
    });

    if (dailyProfit) {
      dailyProfit.totalUsdt = totalUsdt;
      dailyProfit.initialDeposit = initialDeposit;
      dailyProfit.profit = profit;
      await this.dailyProfitRepository.save(dailyProfit);
      return;
    }

    dailyProfit = this.dailyProfitRepository.create({
      date: today as any,
      totalUsdt,
      initialDeposit,
      profit,
    });
    await this.dailyProfitRepository.save(dailyProfit);
  }

  private async calculateTotalUsdt(): Promise<number> {
    const platforms = await this.platformRepository.find();
    const platformBalances = platforms.reduce((sum, p) => sum + Number(p.balance), 0);

    const frozenNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.FROZEN },
    });
    const blockedPesos = frozenNeoBanks.reduce((sum, nb) => {
      const balance = Number(nb.currentBalance);
      const rate = Number(nb.exchangeRate) || 1100;
      return sum + balance / rate;
    }, 0);

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

    const totalEmittedRaw = await this.freeUsdtEntryRepository
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.usdtAmount), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalEmitted = parseFloat(totalEmittedRaw?.sum ?? '0');

    const totalProfitWithdrawnRaw = await this.profitRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalProfitWithdrawn = parseFloat(totalProfitWithdrawnRaw?.sum ?? '0');

    const totalDistributedRaw = await this.freeUsdtDistributionRepository
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.amountUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalDistributed = parseFloat(totalDistributedRaw?.sum ?? '0');

    const freeUsdt = totalEmitted - totalProfitWithdrawn - totalDistributed;

    return platformBalances + blockedPesos + unpaidPesos + freeUsdt;
  }
}
