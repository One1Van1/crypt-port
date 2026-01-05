import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { DirectConvertDto } from './direct-convert.dto';
import { DirectConvertResponseDto } from './direct-convert.response.dto';

@Injectable()
export class DirectConvertService {
  constructor(
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
  ) {}

  async execute(dto: DirectConvertDto, userId: number): Promise<DirectConvertResponseDto> {
    const usdtAmount = dto.amountPesos / dto.exchangeRate;

    // Найти все pending withdrawal текущего пользователя
    const pendingWithdrawals = await this.cashWithdrawalRepository.find({
      where: {
        withdrawnByUserId: userId,
        status: CashWithdrawalStatus.PENDING,
      },
    });

    // Проверить что сумма не превышает доступные средства
    const totalAvailable = pendingWithdrawals.reduce((sum, w) => sum + w.amountPesos, 0);
    
    if (dto.amountPesos > totalAvailable) {
      throw new Error(`Cannot convert ${dto.amountPesos} ARS. Only ${totalAvailable} ARS available.`);
    }

    // Создать конвертацию
    const conversion = this.conversionRepository.create({
      pesosAmount: dto.amountPesos,
      exchangeRate: dto.exchangeRate,
      usdtAmount,
      convertedByUserId: userId,
      cashWithdrawalId: null,
      comment: dto.comment,
      status: ConversionStatus.PENDING, // Ожидает подтверждения админа
    });

    const savedConversion = await this.conversionRepository.save(conversion);

    // Пометить withdrawal как "ожидание подтверждения"
    let remainingAmount = dto.amountPesos;
    for (const withdrawal of pendingWithdrawals) {
      if (remainingAmount <= 0) break;
      
      if (withdrawal.amountPesos <= remainingAmount) {
        // Полностью отправляем этот withdrawal на конвертацию
        withdrawal.status = CashWithdrawalStatus.AWAITING_CONFIRMATION;
        await this.cashWithdrawalRepository.save(withdrawal);
        remainingAmount -= withdrawal.amountPesos;
      } else {
        // Частично (не должно случаться, но для надежности)
        withdrawal.status = CashWithdrawalStatus.AWAITING_CONFIRMATION;
        await this.cashWithdrawalRepository.save(withdrawal);
        remainingAmount = 0;
      }
    }

    return new DirectConvertResponseDto(
      savedConversion.id,
      savedConversion.pesosAmount,
      savedConversion.exchangeRate,
      savedConversion.usdtAmount,
      savedConversion.convertedByUserId,
      savedConversion.createdAt,
    );
  }
}
