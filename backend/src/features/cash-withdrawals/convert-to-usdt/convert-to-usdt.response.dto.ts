import { ApiProperty } from '@nestjs/swagger';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';

export class ConvertToUsdtResponseDto {
  @ApiProperty({ description: 'Conversion ID' })
  id: number;

  @ApiProperty({ description: 'Pesos amount' })
  pesosAmount: number;

  @ApiProperty({ description: 'Exchange rate' })
  exchangeRate: number;

  @ApiProperty({ description: 'USDT amount' })
  usdtAmount: number;

  @ApiProperty({ description: 'Cash withdrawal ID' })
  cashWithdrawalId: number;

  @ApiProperty({ description: 'Converted by user ID' })
  convertedByUserId: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(conversion: PesoToUsdtConversion) {
    this.id = conversion.id;
    this.pesosAmount = Number(conversion.pesosAmount);
    this.exchangeRate = Number(conversion.exchangeRate);
    this.usdtAmount = Number(conversion.usdtAmount);
    this.cashWithdrawalId = conversion.cashWithdrawalId;
    this.convertedByUserId = conversion.convertedByUserId;
    this.createdAt = conversion.createdAt;
  }
}
