import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { Profit } from '../../../entities/profit.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { User } from '../../../entities/user.entity';
import { WithdrawSimpleConfirmedProfitRequestDto } from './withdraw-simple-confirmed.request.dto';
import { WithdrawSimpleConfirmedProfitResponseDto } from './withdraw-simple-confirmed.response.dto';

@Injectable()
export class WithdrawSimpleConfirmedProfitService {
  constructor(
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly pesoToUsdtConversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    dto: WithdrawSimpleConfirmedProfitRequestDto,
    user: User,
  ): Promise<WithdrawSimpleConfirmedProfitResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const availableProfit = await this.calculateAvailableProfit();

      if (availableProfit <= 0) {
        throw new BadRequestException('No profit available to withdraw');
      }

      if (dto.profitUsdtAmount > availableProfit) {
        throw new BadRequestException(
          `Cannot withdraw ${dto.profitUsdtAmount} USDT. Available profit: ${availableProfit.toFixed(2)} USDT`,
        );
      }

      await this.assertFreeUsdtSufficient(dto.profitUsdtAmount);

      const profitPesos = dto.profitUsdtAmount * dto.adminRate;

      const profit = queryRunner.manager.create(Profit, {
        withdrawnUsdt: dto.profitUsdtAmount,
        adminRate: dto.adminRate,
        profitPesos,
        returnedToSection: 'unpaid_pesos',
        returnedAmountPesos: 0,
        createdByUserId: user.id,
      });

      const savedProfit = await queryRunner.manager.save(Profit, profit);

      await queryRunner.commitTransaction();

      return new WithdrawSimpleConfirmedProfitResponseDto(
        savedProfit.id,
        dto.profitUsdtAmount,
        dto.adminRate,
        profitPesos,
        user.id,
        savedProfit.createdAt,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateAvailableProfit(): Promise<number> {
    const totalConfirmedUsdtRaw = await this.pesoToUsdtConversionRepository
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.usdtAmount), 0)', 'sum')
      .where('c.status = :status', { status: ConversionStatus.CONFIRMED })
      .getRawOne<{ sum: string }>();
    const totalConfirmedUsdt = parseFloat(totalConfirmedUsdtRaw?.sum ?? '0');

    const totalWithdrawnUsdtRaw = await this.profitRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalWithdrawnUsdt = parseFloat(totalWithdrawnUsdtRaw?.sum ?? '0');

    const freeUsdt = totalConfirmedUsdt - totalWithdrawnUsdt;

    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    return Math.max(0, freeUsdt - initialDeposit);
  }

  private async assertFreeUsdtSufficient(amount: number): Promise<void> {
    const totalConfirmedUsdtRaw = await this.pesoToUsdtConversionRepository
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.usdtAmount), 0)', 'sum')
      .where('c.status = :status', { status: ConversionStatus.CONFIRMED })
      .getRawOne<{ sum: string }>();
    const totalConfirmedUsdt = parseFloat(totalConfirmedUsdtRaw?.sum ?? '0');

    const totalWithdrawnUsdtRaw = await this.profitRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalWithdrawnUsdt = parseFloat(totalWithdrawnUsdtRaw?.sum ?? '0');

    const freeUsdt = totalConfirmedUsdt - totalWithdrawnUsdt;

    if (freeUsdt < amount) {
      throw new BadRequestException(
        `Insufficient free USDT. Available: ${freeUsdt.toFixed(2)} USDT, Required: ${amount} USDT`,
      );
    }
  }
}
