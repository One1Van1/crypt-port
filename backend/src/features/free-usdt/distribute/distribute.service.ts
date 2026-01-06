import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { Platform } from '../../../entities/platform.entity';
import { Profit } from '../../../entities/profit.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { User } from '../../../entities/user.entity';
import { DistributeFreeUsdtRequestDto } from './distribute.request.dto';
import { DistributeFreeUsdtResponseDto } from './distribute.response.dto';

@Injectable()
export class DistributeFreeUsdtService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: DistributeFreeUsdtRequestDto, user: User): Promise<DistributeFreeUsdtResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const platform = await queryRunner.manager.findOne(Platform, { where: { id: dto.platformId } });
      if (!platform) {
        throw new NotFoundException('Platform not found');
      }

      const freeUsdtBalance = await this.getFreeUsdtBalance(queryRunner.manager);
      const initialDeposit = await this.getInitialDeposit();

      if (dto.amountUsdt > freeUsdtBalance) {
        throw new BadRequestException(
          `Insufficient free USDT. Available: ${freeUsdtBalance.toFixed(2)} USDT, Required: ${dto.amountUsdt} USDT`,
        );
      }

      const availableProfit = Math.max(0, freeUsdtBalance - initialDeposit);
      const balanceAfter = freeUsdtBalance - dto.amountUsdt;

      if (balanceAfter < availableProfit) {
        throw new BadRequestException(
          `Cannot distribute ${dto.amountUsdt} USDT. This would consume profit portion. Available principal: ${Math.min(freeUsdtBalance, initialDeposit).toFixed(2)} USDT`,
        );
      }

      const distribution = queryRunner.manager.create(FreeUsdtDistribution, {
        platformId: platform.id,
        amountUsdt: dto.amountUsdt,
        distributedByUserId: user.id,
        comment: dto.comment ?? null,
      });

      const saved = await queryRunner.manager.save(FreeUsdtDistribution, distribution);

      platform.balance = Number(platform.balance) + Number(dto.amountUsdt);
      const updatedPlatform = await queryRunner.manager.save(Platform, platform);

      await queryRunner.commitTransaction();

      return new DistributeFreeUsdtResponseDto(
        saved.id,
        platform.id,
        Number(dto.amountUsdt),
        Number(updatedPlatform.balance),
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
}
