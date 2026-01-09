import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FreeUsdtAdjustment, FreeUsdtAdjustmentReason } from '../../../entities/free-usdt-adjustment.entity';
import { Profit } from '../../../entities/profit.entity';
import { ProfitReserve } from '../../../entities/profit-reserve.entity';
import { User } from '../../../entities/user.entity';
import { WithdrawSimpleLedgerV2ProfitRequestDto } from './withdraw-simple-ledger-v2.request.dto';
import { WithdrawSimpleLedgerV2ProfitResponseDto } from './withdraw-simple-ledger-v2.response.dto';

@Injectable()
export class WithdrawSimpleLedgerV2ProfitService {
  constructor(
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    dto: WithdrawSimpleLedgerV2ProfitRequestDto,
    user: User,
  ): Promise<WithdrawSimpleLedgerV2ProfitResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const date = this.getTodayDateString();

      const profitReserveRepository = queryRunner.manager.getRepository(ProfitReserve);
      const freeUsdtAdjustmentRepository = queryRunner.manager.getRepository(FreeUsdtAdjustment);

      const reserve = await profitReserveRepository.findOne({ where: { date } });
      const reservedAmountRaw = reserve ? Number(reserve.amountUsdt) : 0;

      const reservedAmount = this.round2(reservedAmountRaw);
      const requestedAmount = this.round2(Number(dto.profitUsdtAmount));

      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        throw new BadRequestException('Invalid profit amount');
      }

      if (reservedAmount <= 0) {
        throw new BadRequestException('No profit available to withdraw');
      }

      // Rounding-safe comparison: allow withdrawing up to reservedAmount within 1 cent.
      if (requestedAmount - reservedAmount > 0.000001) {
        throw new BadRequestException(
          `Cannot withdraw ${requestedAmount.toFixed(2)} USDT. Available profit: ${reservedAmount.toFixed(2)} USDT`,
        );
      }

      const newReservedAmount = this.round2(reservedAmount - requestedAmount);

      if (reserve) {
        const adjustment = freeUsdtAdjustmentRepository.create({
          reason: FreeUsdtAdjustmentReason.RESERVE_PROFIT,
          amountUsdt: String(requestedAmount.toFixed(2)),
          profit_reserve_id: reserve.id,
          created_by_user_id: user.id,
        });
        await freeUsdtAdjustmentRepository.save(adjustment);

        if (newReservedAmount > 0) {
          reserve.amountUsdt = String(newReservedAmount.toFixed(2));
          await profitReserveRepository.save(reserve);
        } else {
          await profitReserveRepository.delete({ id: reserve.id });
        }
      }

      const adminRate = Number(dto.adminRate);
      if (!Number.isFinite(adminRate) || adminRate <= 0) {
        throw new BadRequestException('Invalid admin rate');
      }

      const profitPesos = this.round2(requestedAmount * adminRate);

      const profit = queryRunner.manager.create(Profit, {
        withdrawnUsdt: requestedAmount,
        adminRate: adminRate,
        profitPesos,
        returnedToSection: 'unpaid_pesos',
        returnedAmountPesos: 0,
        createdByUserId: user.id,
      });

      const saved = await queryRunner.manager.save(Profit, profit);

      await queryRunner.commitTransaction();

      return new WithdrawSimpleLedgerV2ProfitResponseDto({
        id: saved.id,
        withdrawnUsdt: requestedAmount,
        adminRate,
        profitPesos,
        createdByUserId: user.id,
        createdAt: saved.createdAt,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private round2(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 100) / 100;
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
