import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Profit } from '../../../entities/profit.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { User } from '../../../entities/user.entity';
import { WithdrawSimpleProfitRequestDto } from './withdraw-simple.request.dto';
import { WithdrawSimpleProfitResponseDto } from './withdraw-simple.response.dto';

@Injectable()
export class WithdrawSimpleProfitService {
  constructor(
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly pesoToUsdtConversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: WithdrawSimpleProfitRequestDto, user: User): Promise<WithdrawSimpleProfitResponseDto> {
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

      // Note: entity requires these fields; for simple withdrawal we store zeros.
      const profit = queryRunner.manager.create(Profit, {
        withdrawnUsdt: dto.profitUsdtAmount,
        adminRate: dto.adminRate,
        profitPesos: profitPesos,
        returnedToSection: 'unpaid_pesos',
        returnedAmountPesos: 0,
        createdByUserId: user.id,
      });

      const savedProfit = await queryRunner.manager.save(Profit, profit);

      await queryRunner.commitTransaction();

      return new WithdrawSimpleProfitResponseDto(
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
    // Profit = freeUsdt - initialDeposit
    // freeUsdt = totalConvertedUsdt - totalWithdrawnUsdt

    const conversions = await this.pesoToUsdtConversionRepository.find();
    const totalConvertedUsdt = conversions.reduce((sum, conv) => sum + Number(conv.usdtAmount), 0);

    const withdrawnProfits = await this.profitRepository.find();
    const totalWithdrawnUsdt = withdrawnProfits.reduce((sum, profit) => sum + Number(profit.withdrawnUsdt), 0);

    const freeUsdt = totalConvertedUsdt - totalWithdrawnUsdt;

    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });

    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    return Math.max(0, freeUsdt - initialDeposit);
  }

  private async assertFreeUsdtSufficient(amount: number): Promise<void> {
    const conversions = await this.pesoToUsdtConversionRepository.find();
    const totalConvertedUsdt = conversions.reduce((sum, conv) => sum + Number(conv.usdtAmount), 0);

    const withdrawnProfits = await this.profitRepository.find();
    const totalWithdrawnUsdt = withdrawnProfits.reduce((sum, profit) => sum + Number(profit.withdrawnUsdt), 0);

    const freeUsdt = totalConvertedUsdt - totalWithdrawnUsdt;

    if (freeUsdt < amount) {
      throw new BadRequestException(
        `Insufficient free USDT. Available: ${freeUsdt.toFixed(2)} USDT, Required: ${amount} USDT`,
      );
    }
  }
}
