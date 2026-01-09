import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ReserveProfitV2RequestDto } from './reserve-profit-v2.request.dto';
import { ReserveProfitV2ResponseDto } from './reserve-profit-v2.response.dto';
import { BankAccount } from '../../../entities/bank-account.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { Profit } from '../../../entities/profit.entity';
import { ProfitReserve } from '../../../entities/profit-reserve.entity';
import { DeficitRecord } from '../../../entities/deficit-record.entity';
import { FreeUsdtAdjustment, FreeUsdtAdjustmentReason } from '../../../entities/free-usdt-adjustment.entity';
import { Platform } from '../../../entities/platform.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { User } from '../../../entities/user.entity';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';

@Injectable()
export class ReserveProfitV2Service {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingsRepository: Repository<SystemSetting>,

    @InjectRepository(Platform)
    private readonly platformsRepository: Repository<Platform>,

    @InjectRepository(BankAccount)
    private readonly bankAccountsRepository: Repository<BankAccount>,

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

  async execute(dto: ReserveProfitV2RequestDto, user: User): Promise<ReserveProfitV2ResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const date = dto.date ?? this.getTodayDateString();

      const systemSettingsRepository = manager.getRepository(SystemSetting);
      const platformsRepository = manager.getRepository(Platform);
      const bankAccountsRepository = manager.getRepository(BankAccount);
      const cashWithdrawalsRepository = manager.getRepository(CashWithdrawal);
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

      // Platforms total USDT
      const platforms = await platformsRepository.find();
      const platformTotalUsdt = platforms.reduce((acc, p) => acc + Number(p.balance ?? 0), 0);

      // Unpaid pesos (v2 rule): ONLY bank_accounts.withdrawnAmount
      // USDT conversion is based on the per-operation platform rate (via neo-bank/platform).
      const ops = await manager.getRepository(BankAccountWithdrawnOperation).find({
        where: { type: BankAccountWithdrawnOperationType.CREDIT },
      });

      let unpaidTotalUsdt = 0;
      for (const op of ops) {
        const remaining = Number(op.remainingPesos ?? 0);
        const rate = Number(op.platformRate ?? 0);
        if (!Number.isFinite(remaining) || remaining <= 0) continue;
        if (!Number.isFinite(rate) || rate <= 0) continue;
        unpaidTotalUsdt += remaining / rate;
      }

      if (!Number.isFinite(unpaidTotalUsdt)) unpaidTotalUsdt = 0;

      // "В обмене": pending cash withdrawals USDT equivalent
      const deficit = await cashWithdrawalsRepository
        .createQueryBuilder('cw')
        .select('COALESCE(SUM(cw.amountPesos / NULLIF(cw.withdrawalRate, 0)), 0)', 'sum')
        .where('cw.status = :status', { status: CashWithdrawalStatus.PENDING })
        .getRawOne<{ sum: string }>();
      const deficitUsdt = Number(deficit?.sum ?? 0);

      // Free USDT (ledger-based): entries - profit withdrawals - distributions (+ adjustments)
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

      // Same invariant as v1 reserve-profit:
      // - profit delta must be calculated WITHOUT RESERVE_PROFIT adjustments
      // - availability check uses Free USDT INCLUDING existing RESERVE_PROFIT adjustments
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

      // Working deposit (v2 rules): platforms + unpaid(bank_accounts.withdrawnAmount) + free + inExchange
      // NOTE: frozen/blocked pesos are excluded.
      const workingDepositUsdt = platformTotalUsdt + unpaidTotalUsdt + freeUsdtForProfit + deficitUsdt;

      const deltaUsdt = workingDepositUsdt - initialDepositUsdt;

      const existingReserve = await profitReservesRepository.findOne({ where: { date } });
      const existingReserveAmount = Number(existingReserve?.amountUsdt ?? 0);

      // Target profit reserve is only when delta > 0
      const targetReserveAmount = Math.max(0, deltaUsdt);
      const reserveDiff = targetReserveAmount - existingReserveAmount;

      if (reserveDiff > 0 && freeUsdtAvailableBeforeUpdate < reserveDiff) {
        throw new BadRequestException('Not enough Free USDT to reserve profit');
      }

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

        await deficitRecordsRepository.delete({ date });
        reservedProfitUsdt = Math.abs(reserveDiff);
      } else {
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
        await deficitRecordsRepository.delete({ date });
      }

      return new ReserveProfitV2ResponseDto({
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
