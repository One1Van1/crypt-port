import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { Profit } from '../../../entities/profit.entity';
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
      const freeUsdtBalance = await this.getFreeUsdtBalance(queryRunner.manager);
      const initialDeposit = await this.getInitialDeposit();

      const availableProfit = Math.max(0, freeUsdtBalance - initialDeposit);

      if (availableProfit <= 0) {
        throw new BadRequestException('No profit available to withdraw');
      }

      if (dto.profitUsdtAmount > availableProfit) {
        throw new BadRequestException(
          `Cannot withdraw ${dto.profitUsdtAmount} USDT. Available profit: ${availableProfit.toFixed(2)} USDT`,
        );
      }

      if (dto.profitUsdtAmount > freeUsdtBalance) {
        throw new BadRequestException(
          `Insufficient free USDT. Available: ${freeUsdtBalance.toFixed(2)} USDT, Required: ${dto.profitUsdtAmount} USDT`,
        );
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
}
