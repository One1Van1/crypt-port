import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { DailyProfit } from '../../../entities/daily-profit.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { FreeUsdtAdjustment } from '../../../entities/free-usdt-adjustment.entity';
import { Platform } from '../../../entities/platform.entity';
import { Profit } from '../../../entities/profit.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';
import { ProfitReserve } from '../../../entities/profit-reserve.entity';
import { Debt } from '../../../entities/debt.entity';
import { DebtOperation, DebtOperationType } from '../../../entities/debt-operation.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { User } from '../../../entities/user.entity';
import { ConfirmConversionLedgerV2ResponseDto } from './confirm-conversion-ledger-v2.response.dto';

@Injectable()
export class ConfirmConversionLedgerV2Service {
  constructor(
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(DailyProfit)
    private readonly dailyProfitRepository: Repository<DailyProfit>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(ProfitReserve)
    private readonly profitReserveRepository: Repository<ProfitReserve>,
    @InjectRepository(FreeUsdtEntry)
    private readonly freeUsdtEntryRepository: Repository<FreeUsdtEntry>,
    @InjectRepository(FreeUsdtDistribution)
    private readonly freeUsdtDistributionRepository: Repository<FreeUsdtDistribution>,
    @InjectRepository(FreeUsdtAdjustment)
    private readonly freeUsdtAdjustmentRepository: Repository<FreeUsdtAdjustment>,
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtOperation)
    private readonly debtOperationRepository: Repository<DebtOperation>,
  ) {}

  async execute(id: number, user: User): Promise<ConfirmConversionLedgerV2ResponseDto> {
    const conversion = await this.conversionRepository.findOne({
      where: { id },
      relations: ['convertedByUser'],
      withDeleted: true,
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

    let freeUsdtEntryCreated = false;

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
      freeUsdtEntryCreated = true;
    }

    const { repaidUsdt, remainingDebtUsdt } = await this.repayDebtFromConversion(conversion, user);

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

    return new ConfirmConversionLedgerV2ResponseDto({
      id: conversion.id,
      status: conversion.status,
      usdtAmount: conversion.usdtAmount,
      freeUsdtEntryCreated,
      debtRepaidUsdt: repaidUsdt,
      debtRemainingUsdt: remainingDebtUsdt,
    });
  }

  private async repayDebtFromConversion(
    conversion: PesoToUsdtConversion,
    user: User,
  ): Promise<{ repaidUsdt: number; remainingDebtUsdt: number }> {
    let debt = await this.debtRepository.findOne({ where: { key: 'global' } });
    if (!debt) {
      debt = await this.debtRepository.save(this.debtRepository.create({ key: 'global', amountUsdt: '0' }));
    }

    const currentDebt = Number(debt.amountUsdt) || 0;
    if (currentDebt <= 0) {
      return { repaidUsdt: 0, remainingDebtUsdt: 0 };
    }

    const usdtAmount = Number(conversion.usdtAmount) || 0;
    const repaid = Math.max(0, Math.min(currentDebt, usdtAmount));

    if (repaid <= 0) {
      return { repaidUsdt: 0, remainingDebtUsdt: currentDebt };
    }

    const newDebt = currentDebt - repaid;
    debt.amountUsdt = String(newDebt);
    await this.debtRepository.save(debt);

    await this.debtOperationRepository.save(
      this.debtOperationRepository.create({
        debtId: debt.id,
        type: DebtOperationType.REPAYMENT_FROM_UNPAID_PESO_EXCHANGE,
        deltaUsdt: String(-repaid),
        source_conversion_id: conversion.id,
        created_by_user_id: user.id,
        comment: null,
      }),
    );

    return { repaidUsdt: repaid, remainingDebtUsdt: newDebt };
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async updateTodayProfit(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const totalUsdt = await this.calculateTotalUsdtV3();

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

  private async calculateTotalUsdtV3(): Promise<number> {
    const platforms = await this.platformRepository.find();
    const platformBalances = platforms.reduce((sum, p) => sum + Number(p.balance), 0);

    const unpaidUsdt = await this.calculateUnpaidPesosUsdt();

    const freeUsdtNet = await this.calculateFreeUsdtNet();

    const profitReserve = await this.calculateProfitReserveUsdt();

    const deficitUsdt = await this.calculateDeficitUsdt();

    const debtUsdt = await this.calculateCurrentDebtUsdt();

    return platformBalances + unpaidUsdt + freeUsdtNet + profitReserve + deficitUsdt - debtUsdt;
  }

  private async calculateUnpaidPesosUsdt(): Promise<number> {
    const bankAccounts = await this.bankAccountRepository.find();
    const opRepo = this.conversionRepository.manager.getRepository(BankAccountWithdrawnOperation);

    let totalUsdt = 0;

    for (const account of bankAccounts) {
      const amountPesos = Number(account.withdrawnAmount) || 0;
      if (amountPesos <= 0) continue;

      const credits = await opRepo.find({
        where: {
          bankAccountId: account.id,
          type: BankAccountWithdrawnOperationType.CREDIT,
        },
        order: { id: 'ASC' },
      });

      for (const c of credits) {
        const remaining = Number(c.remainingPesos ?? 0);
        const rate = Number(c.platformRate ?? 0);
        if (!Number.isFinite(remaining) || remaining <= 0) continue;
        if (!Number.isFinite(rate) || rate <= 0) continue;
        totalUsdt += remaining / rate;
      }
    }

    return Number.isFinite(totalUsdt) ? totalUsdt : 0;
  }

  private async calculateFreeUsdtNet(): Promise<number> {
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

    const totalAdjustmentsRaw = await this.freeUsdtAdjustmentRepository
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amountUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalAdjustments = parseFloat(totalAdjustmentsRaw?.sum ?? '0');

    const totalOut = totalProfitWithdrawn + totalDistributed;
    const totalWithdrawn = totalOut - totalAdjustments;

    // Debt repayments are stored as negative deltas. Total repaid = -SUM(delta).
    const totalDeltaRaw = await this.debtOperationRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.deltaUsdt), 0)', 'sum')
      .where('o.type = :type', { type: DebtOperationType.REPAYMENT_FROM_UNPAID_PESO_EXCHANGE })
      .getRawOne<{ sum: string }>();
    const totalRepaid = -parseFloat(totalDeltaRaw?.sum ?? '0');

    const freeUsdt = totalEmitted - totalWithdrawn - totalRepaid;

    return Number.isFinite(freeUsdt) ? freeUsdt : 0;
  }

  private async calculateProfitReserveUsdt(): Promise<number> {
    const today = this.getTodayDateString();
    const reserve = await this.profitReserveRepository.findOne({ where: { date: today } });
    const totalUsdt = reserve ? Number(reserve.amountUsdt) : 0;
    return Number.isFinite(totalUsdt) ? totalUsdt : 0;
  }

  private async calculateDeficitUsdt(): Promise<number> {
    const pendingWithdrawals = await this.cashWithdrawalRepository.find({
      where: { status: CashWithdrawalStatus.PENDING },
    });

    let totalUsdt = 0;
    for (const w of pendingWithdrawals) {
      const amountPesos = Number(w.amountPesos);
      const withdrawalRate = Number(w.withdrawalRate);
      const amountUsdt = withdrawalRate > 0 ? amountPesos / withdrawalRate : 0;
      totalUsdt += Number.isFinite(amountUsdt) ? amountUsdt : 0;
    }

    return Number.isFinite(totalUsdt) ? totalUsdt : 0;
  }

  private async calculateCurrentDebtUsdt(): Promise<number> {
    let debt = await this.debtRepository.findOne({ where: { key: 'global' } });
    if (!debt) {
      debt = await this.debtRepository.save(this.debtRepository.create({ key: 'global', amountUsdt: '0' }));
    }
    const value = Number(debt.amountUsdt) || 0;
    return Number.isFinite(value) ? value : 0;
  }
}
