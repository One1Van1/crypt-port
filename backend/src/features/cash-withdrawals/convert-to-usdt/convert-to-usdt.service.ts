import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { ConvertToUsdtDto } from './convert-to-usdt.dto';
import { ConvertToUsdtResponseDto } from './convert-to-usdt.response.dto';

@Injectable()
export class ConvertToUsdtService {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
  ) {}

  async execute(withdrawalId: number, dto: ConvertToUsdtDto, userId: number): Promise<ConvertToUsdtResponseDto> {
    // Найти запись о заборе наличных
    const withdrawal = await this.cashWithdrawalRepository.findOne({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new NotFoundException(`Cash withdrawal with ID ${withdrawalId} not found`);
    }

    // Проверить что статус pending
    if (withdrawal.status !== CashWithdrawalStatus.PENDING) {
      throw new BadRequestException('This withdrawal has already been converted');
    }

    // Рассчитать USDT
    const usdtAmount = withdrawal.amountPesos / dto.exchangeRate;

    // Создать конвертацию
    const conversion = this.conversionRepository.create({
      pesosAmount: withdrawal.amountPesos,
      exchangeRate: dto.exchangeRate,
      usdtAmount: usdtAmount,
      cashWithdrawalId: withdrawal.id,
      convertedByUserId: userId,
    });

    const savedConversion = await this.conversionRepository.save(conversion);

    // Обновить статус withdrawal
    await this.cashWithdrawalRepository.update(
      { id: withdrawal.id },
      { status: CashWithdrawalStatus.CONVERTED },
    );

    return new ConvertToUsdtResponseDto(savedConversion);
  }
}
