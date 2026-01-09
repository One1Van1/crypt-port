import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { FreeUsdtAdjustment } from '../../../entities/free-usdt-adjustment.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { Platform } from '../../../entities/platform.entity';
import { Profit } from '../../../entities/profit.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { User } from '../../../entities/user.entity';
import { DistributeFreeUsdtBatchRequestDto } from './distribute-batch.request.dto';
import {
  DistributeFreeUsdtBatchResponseDto,
  DistributeFreeUsdtBatchResultItemDto,
} from './distribute-batch.response.dto';

@Injectable()
export class DistributeFreeUsdtBatchService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    dto: DistributeFreeUsdtBatchRequestDto,
    user: User,
  ): Promise<DistributeFreeUsdtBatchResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const items = dto.items ?? [];
      if (items.length === 0) {
        throw new BadRequestException('Items are required');
      }

      const platformIds = items.map((i) => i.platformId);
      const uniquePlatformIds = new Set(platformIds);
      if (uniquePlatformIds.size !== platformIds.length) {
        throw new BadRequestException('Duplicate platformId in items');
      }

      const totalToDistribute = this.round2(
        items.reduce((sum, i) => sum + Number(i.amountUsdt || 0), 0),
      );

      if (!Number.isFinite(totalToDistribute) || totalToDistribute <= 0) {
        throw new BadRequestException('Total amount must be greater than 0');
      }

      const platforms = await queryRunner.manager.getRepository(Platform).find({
        where: { id: In(platformIds) },
      });

      if (platforms.length !== platformIds.length) {
        const found = new Set(platforms.map((p) => p.id));
        const missing = platformIds.filter((id) => !found.has(id));
        throw new NotFoundException(`Platform not found: ${missing.join(', ')}`);
      }

      const freeUsdtBefore = await this.getFreeUsdtBalance(queryRunner.manager);
      const initialDeposit = await this.getInitialDeposit();

      if (totalToDistribute > freeUsdtBefore) {
        throw new BadRequestException(
          `Insufficient free USDT. Available: ${freeUsdtBefore.toFixed(2)} USDT, Required: ${totalToDistribute.toFixed(2)} USDT`,
        );
      }

      const availableProfit = Math.max(0, freeUsdtBefore - initialDeposit);
      const freeUsdtAfter = this.round2(freeUsdtBefore - totalToDistribute);

      if (freeUsdtAfter < availableProfit) {
        throw new BadRequestException(
          `Cannot distribute ${totalToDistribute.toFixed(2)} USDT. This would consume profit portion. Available principal: ${Math.min(freeUsdtBefore, initialDeposit).toFixed(2)} USDT`,
        );
      }

      const distributionRepo = queryRunner.manager.getRepository(FreeUsdtDistribution);
      const platformRepo = queryRunner.manager.getRepository(Platform);

      const platformById = new Map<number, Platform>();
      platforms.forEach((p) => platformById.set(p.id, p));

      const results: DistributeFreeUsdtBatchResultItemDto[] = [];
      let createdAt: Date | null = null;

      for (const item of items) {
        const amount = this.round2(Number(item.amountUsdt));
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new BadRequestException('Invalid amountUsdt');
        }

        const platform = platformById.get(item.platformId);
        if (!platform) {
          throw new NotFoundException('Platform not found');
        }

        const distribution = distributionRepo.create({
          platformId: platform.id,
          amountUsdt: amount,
          distributedByUserId: user.id,
          comment: item.comment ?? dto.comment ?? null,
        });

        const saved = await distributionRepo.save(distribution);
        if (!createdAt) createdAt = saved.createdAt;

        platform.balance = this.round2(Number(platform.balance) + amount);
        const updatedPlatform = await platformRepo.save(platform);

        results.push(
          new DistributeFreeUsdtBatchResultItemDto({
            distributionId: saved.id,
            platformId: platform.id,
            amountUsdt: amount,
            platformBalanceAfter: Number(updatedPlatform.balance),
          }),
        );
      }

      await queryRunner.commitTransaction();

      return new DistributeFreeUsdtBatchResponseDto({
        items: results,
        totalDistributedUsdt: totalToDistribute,
        freeUsdtBefore: this.round2(freeUsdtBefore),
        freeUsdtAfter,
        distributedByUserId: user.id,
        createdAt: createdAt ?? new Date(),
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

    const totalAdjustmentsRaw = await manager
      .getRepository(FreeUsdtAdjustment)
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amountUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalAdjustments = parseFloat(totalAdjustmentsRaw?.sum ?? '0');

    return totalEmitted - totalProfitWithdrawn - totalDistributed + totalAdjustments;
  }
}
