import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ReserveProfitRequestDto } from './reserve-profit.request.dto';
import { ReserveProfitResponseDto } from './reserve-profit.response.dto';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { Platform } from '../../../entities/platform.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { Profit } from '../../../entities/profit.entity';
import { ProfitReserve } from '../../../entities/profit-reserve.entity';
import { DeficitRecord } from '../../../entities/deficit-record.entity';
import { FreeUsdtAdjustment, FreeUsdtAdjustmentReason } from '../../../entities/free-usdt-adjustment.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { User } from '../../../entities/user.entity';

@Injectable()
export class ReserveProfitService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingsRepository: Repository<SystemSetting>,

    @InjectRepository(Platform)
    private readonly platformsRepository: Repository<Platform>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    @InjectRepository(DropNeoBank)
    private readonly dropNeoBanksRepository: Repository<DropNeoBank>,

    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalsRepository: Repository<CashWithdrawal>,

    @InjectRepository(FreeUsdtEntry)
    private readonly freeUsdtEntriesRepository: Repository<FreeUsdtEntry>,

    @InjectRepository(FreeUsdtDistribution)
    private readonly freeUsdtDistributionsRepository: Repository<FreeUsdtDistribution>,

    @InjectRepository(Profit)
    private readonly profitsRepository: Repository<Profit>,

    @InjectRepository(ProfitReserve)
    private readonly profitReservesRepository: Repository<ProfitReserve>,

    @InjectRepository(DeficitRecord)
    private readonly deficitRecordsRepository: Repository<DeficitRecord>,

    @InjectRepository(FreeUsdtAdjustment)
    private readonly freeUsdtAdjustmentsRepository: Repository<FreeUsdtAdjustment>,

    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: ReserveProfitRequestDto, user: User): Promise<ReserveProfitResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const date = dto.date ?? this.getTodayDateString();

      const systemSettingsRepository = manager.getRepository(SystemSetting);
      const platformsRepository = manager.getRepository(Platform);
      const transactionsRepository = manager.getRepository(Transaction);
      const cashWithdrawalsRepository = manager.getRepository(CashWithdrawal);
      const dropNeoBanksRepository = manager.getRepository(DropNeoBank);
      const freeUsdtEntriesRepository = manager.getRepository(FreeUsdtEntry);
      const freeUsdtDistributionsRepository = manager.getRepository(FreeUsdtDistribution);
      const profitsRepository = manager.getRepository(Profit);
      const profitReservesRepository = manager.getRepository(ProfitReserve);
      const deficitRecordsRepository = manager.getRepository(DeficitRecord);
      const freeUsdtAdjustmentsRepository = manager.getRepository(FreeUsdtAdjustment);

      const initialDepositSetting = await systemSettingsRepository.findOne({
        where: { key: 'initial_deposit' },
      });
      const initialDepositUsdt = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    // Total USDT on platforms
      const platforms = await platformsRepository.find();
      const platformTotalUsdt = platforms.reduce((acc, p) => acc + Number(p.balance ?? 0), 0);

      // Blocked (frozen) neo-banks
      const frozenNeoBanks = await dropNeoBanksRepository.find({
        where: { status: NeoBankStatus.FROZEN },
        relations: ['platform'],
      });

      let blockedTotalUsdt = 0;
      for (const neoBank of frozenNeoBanks) {
        const balance = Number(neoBank.currentBalance) || 0;
        const rate = Number(neoBank.exchangeRate) || 1100;
        const balanceUsdt = Number(neoBank.usdtEquivalent) || balance / rate;
        blockedTotalUsdt += Number(balanceUsdt) || 0;
      }

      // Unpaid: active neo-banks + pending transactions
      const activeNeoBanks = await dropNeoBanksRepository.find({
        where: { status: NeoBankStatus.ACTIVE },
        relations: ['platform'],
      });

      let unpaidTotalUsdt = 0;

      for (const neoBank of activeNeoBanks) {
        const balance = Number(neoBank.currentBalance) || 0;
        const rate = Number(neoBank.exchangeRate) || 1100;
        const balanceUsdt = Number(neoBank.usdtEquivalent) || balance / rate;
        unpaidTotalUsdt += Number(balanceUsdt) || 0;
      }

      const pendingTransactions = await transactionsRepository.find({
        where: { status: TransactionStatus.PENDING },
      });

      for (const transaction of pendingTransactions) {
        const amount = Number(transaction.amount) || 0;
        const rate = Number(transaction.exchangeRate) || 1100;
        unpaidTotalUsdt += amount / rate;
      }

      // "В обмене": pending cash withdrawals USDT equivalent
      const deficit = await cashWithdrawalsRepository
        .createQueryBuilder('cw')
        .select('COALESCE(SUM(cw.amountPesos / NULLIF(cw.withdrawalRate, 0)), 0)', 'sum')
        .where('cw.status = :status', { status: CashWithdrawalStatus.PENDING })
        .getRawOne<{ sum: string }>();
      const deficitUsdt = Number(deficit?.sum ?? 0);

    // Free USDT (ledger-based): entries - profit withdrawals - distributions
      const entries = await freeUsdtEntriesRepository
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.usdtAmount), 0)', 'sum')
        .getRawOne<{ sum: string }>();
      const entriesUsdt = Number(entries?.sum ?? 0);

      const withdrawnProfit = await profitsRepository
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
        .getRawOne<{ sum: string }>();
      const withdrawnProfitUsdt = Number(withdrawnProfit?.sum ?? 0);

      const distributed = await freeUsdtDistributionsRepository
        .createQueryBuilder('d')
        .select('COALESCE(SUM(d.amountUsdt), 0)', 'sum')
        .getRawOne<{ sum: string }>();
      const distributedUsdt = Number(distributed?.sum ?? 0);

      // IMPORTANT:
      // - Profit (delta) must be calculated from Free USDT WITHOUT RESERVE_PROFIT adjustments.
      //   Otherwise, once profit is reserved, delta collapses to ~0.
      // - Availability check uses current Free USDT INCLUDING existing RESERVE_PROFIT adjustments.
      const adjustmentsSplit = await freeUsdtAdjustmentsRepository
        .createQueryBuilder('a')
        .select(
          'COALESCE(SUM(CASE WHEN a.reason = :reserveReason THEN a.amountUsdt ELSE 0 END), 0)',
          'reserveSum',
        )
        .addSelect(
          'COALESCE(SUM(CASE WHEN a.reason <> :reserveReason THEN a.amountUsdt ELSE 0 END), 0)',
          'otherSum',
        )
        .setParameter('reserveReason', FreeUsdtAdjustmentReason.RESERVE_PROFIT)
        .getRawOne<{ reserveSum: string; otherSum: string }>();

      const reserveAdjustmentsUsdt = Number(adjustmentsSplit?.reserveSum ?? 0);
      const otherAdjustmentsUsdt = Number(adjustmentsSplit?.otherSum ?? 0);

      const freeUsdtForProfit =
        entriesUsdt - withdrawnProfitUsdt - distributedUsdt + otherAdjustmentsUsdt;

      const freeUsdtAvailableBeforeUpdate = freeUsdtForProfit + reserveAdjustmentsUsdt;

      // Working deposit (same meaning as existing sections-ledger):
      // platforms + blocked + unpaid + free + inExchange
      const workingDepositUsdt =
        platformTotalUsdt + blockedTotalUsdt + unpaidTotalUsdt + freeUsdtForProfit + deficitUsdt;

      const deltaUsdt = workingDepositUsdt - initialDepositUsdt;

      const existingReserve = await profitReservesRepository.findOne({ where: { date } });
      const existingReserveAmount = Number(existingReserve?.amountUsdt ?? 0);

      // Target profit reserve is only when delta > 0
      const targetReserveAmount = Math.max(0, deltaUsdt);
      const reserveDiff = targetReserveAmount - existingReserveAmount;

      // If we need to increase profit reserve, we must have enough free USDT
      if (reserveDiff > 0 && freeUsdtAvailableBeforeUpdate < reserveDiff) {
        throw new BadRequestException('Not enough Free USDT to reserve profit');
      }

      // Apply profit reserve update (create/update/delete) + Free USDT adjustment if needed
      let reservedProfitUsdt = 0;
      if (targetReserveAmount > 0) {
        const reserve = profitReservesRepository.create({
          date,
          amountUsdt: String(targetReserveAmount),
          workingDepositUsdt: String(workingDepositUsdt),
          initialDepositUsdt: String(initialDepositUsdt),
          created_by_user_id: user?.id,
        });

        if (existingReserve) {
          reserve.id = existingReserve.id;
        }

        const savedReserve = await profitReservesRepository.save(reserve);

        if (reserveDiff !== 0) {
          const adjustment = freeUsdtAdjustmentsRepository.create({
            reason: FreeUsdtAdjustmentReason.RESERVE_PROFIT,
            // Negative decreases free-usdt when reserve grows; positive increases when reserve shrinks
            amountUsdt: String(-reserveDiff),
            profit_reserve_id: savedReserve.id,
            created_by_user_id: user?.id,
          });
          await freeUsdtAdjustmentsRepository.save(adjustment);
        }

        // Profit scenario: no deficit record for this date
        await deficitRecordsRepository.delete({ date });

        reservedProfitUsdt = Math.abs(reserveDiff);
      } else {
        // No profit: if there was a reserve, release it back to free-usdt
        if (existingReserveAmount > 0) {
          const adjustment = freeUsdtAdjustmentsRepository.create({
            reason: FreeUsdtAdjustmentReason.RESERVE_PROFIT,
            amountUsdt: String(existingReserveAmount),
            profit_reserve_id: existingReserve?.id,
            created_by_user_id: user?.id,
          });
          await freeUsdtAdjustmentsRepository.save(adjustment);
        }
        await profitReservesRepository.delete({ date });
      }

      // Deficit handling (delta < 0) => write deficit record
      let deficitAmount = 0;
      if (deltaUsdt < 0) {
        deficitAmount = Math.abs(deltaUsdt);
        const existingDeficit = await deficitRecordsRepository.findOne({ where: { date } });
        const record = deficitRecordsRepository.create({
          date,
          amountUsdt: String(deficitAmount),
          workingDepositUsdt: String(workingDepositUsdt),
          initialDepositUsdt: String(initialDepositUsdt),
          created_by_user_id: user?.id,
        });
        if (existingDeficit) {
          record.id = existingDeficit.id;
        }
        await deficitRecordsRepository.save(record);
      } else {
        // Not deficit
        await deficitRecordsRepository.delete({ date });
      }

      return new ReserveProfitResponseDto({
        date,
        workingDepositUsdt,
        initialDepositUsdt,
        deltaUsdt,
        reservedProfitUsdt,
        deficitUsdt: deficitAmount,
      });
    });
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
