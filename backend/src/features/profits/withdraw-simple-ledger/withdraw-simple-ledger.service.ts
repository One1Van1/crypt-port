import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { FreeUsdtAdjustment, FreeUsdtAdjustmentReason } from '../../../entities/free-usdt-adjustment.entity';
import { Profit } from '../../../entities/profit.entity';
import { ProfitReserve } from '../../../entities/profit-reserve.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { User } from '../../../entities/user.entity';
import { WithdrawSimpleLedgerProfitRequestDto } from './withdraw-simple-ledger.request.dto';
import { WithdrawSimpleLedgerProfitResponseDto } from './withdraw-simple-ledger.response.dto';

@Injectable()
export class WithdrawSimpleLedgerProfitService {
  constructor(
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(FreeUsdtEntry)
    private readonly freeUsdtEntryRepository: Repository<FreeUsdtEntry>,
    @InjectRepository(FreeUsdtDistribution)
    private readonly freeUsdtDistributionRepository: Repository<FreeUsdtDistribution>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    dto: WithdrawSimpleLedgerProfitRequestDto,
    user: User,
  ): Promise<WithdrawSimpleLedgerProfitResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const date = this.getTodayDateString();

      // Profit is withdrawn from the reserved profit bucket (profit_reserves),
      // not from "Free USDT" directly.
      const profitReserveRepository = queryRunner.manager.getRepository(ProfitReserve);
      const freeUsdtAdjustmentRepository = queryRunner.manager.getRepository(FreeUsdtAdjustment);

      const reserve = await profitReserveRepository.findOne({ where: { date } });
      const reservedAmount = reserve ? Number(reserve.amountUsdt) : 0;

      if (reservedAmount <= 0) {
        throw new BadRequestException('No profit available to withdraw');
      }

      if (dto.profitUsdtAmount > reservedAmount) {
        throw new BadRequestException(
          `Cannot withdraw ${dto.profitUsdtAmount} USDT. Available profit: ${reservedAmount.toFixed(2)} USDT`,
        );
      }

      // Decrease today's reserve by withdrawn amount
      const newReservedAmount = reservedAmount - dto.profitUsdtAmount;
      if (reserve) {
        if (newReservedAmount > 0) {
          reserve.amountUsdt = String(newReservedAmount);
          await profitReserveRepository.save(reserve);
        } else {
          await profitReserveRepository.delete({ id: reserve.id });
        }

        // Release withdrawn amount from reserve-accounting so Free USDT doesn't drift.
        // (Free USDT is reduced by reserve adjustments; as reserve shrinks, we add a + adjustment.)
        const adjustment = freeUsdtAdjustmentRepository.create({
          reason: FreeUsdtAdjustmentReason.RESERVE_PROFIT,
          amountUsdt: String(dto.profitUsdtAmount),
          profit_reserve_id: reserve.id,
          created_by_user_id: user.id,
        });
        await freeUsdtAdjustmentRepository.save(adjustment);
      }

      const profitPesos = dto.profitUsdtAmount * dto.adminRate;

      const profit = queryRunner.manager.create(Profit, {
        withdrawnUsdt: dto.profitUsdtAmount,
        adminRate: dto.adminRate,
        profitPesos,
        returnedToSection: 'unpaid_pesos',
        returnedAmountPesos: 0,
        createdByUserId: user.id,
      });

      const saved = await queryRunner.manager.save(Profit, profit);

      await queryRunner.commitTransaction();

      return new WithdrawSimpleLedgerProfitResponseDto(
        saved.id,
        dto.profitUsdtAmount,
        dto.adminRate,
        profitPesos,
        user.id,
        saved.createdAt,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async getInitialDeposit(): Promise<number> {
    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    return initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;
  }

  private async getFreeUsdtBalance(manager: EntityManager): Promise<number> {
    const totalEmittedRaw = await manager
      .getRepository(FreeUsdtEntry)
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.usdtAmount), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalEmitted = parseFloat(totalEmittedRaw?.sum ?? '0');

    const totalProfitWithdrawnRaw = await manager
      .getRepository(Profit)
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalProfitWithdrawn = parseFloat(totalProfitWithdrawnRaw?.sum ?? '0');

    const totalDistributedRaw = await manager
      .getRepository(FreeUsdtDistribution)
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.amountUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalDistributed = parseFloat(totalDistributedRaw?.sum ?? '0');

    return totalEmitted - totalProfitWithdrawn - totalDistributed;
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
