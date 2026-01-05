import { ApiProperty } from '@nestjs/swagger';

export class DirectConvertResponseDto {
  @ApiProperty({ description: 'Conversion ID' })
  id: number;

  @ApiProperty({ description: 'Amount in pesos' })
  pesosAmount: number;

  @ApiProperty({ description: 'Exchange rate used' })
  exchangeRate: number;

  @ApiProperty({ description: 'Resulting USDT amount' })
  usdtAmount: number;

  @ApiProperty({ description: 'User who performed the conversion' })
  convertedByUserId: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  constructor(
    id: number,
    pesosAmount: number,
    exchangeRate: number,
    usdtAmount: number,
    convertedByUserId: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.pesosAmount = pesosAmount;
    this.exchangeRate = exchangeRate;
    this.usdtAmount = usdtAmount;
    this.convertedByUserId = convertedByUserId;
    this.createdAt = createdAt;
  }
}
