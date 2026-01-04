import { ApiProperty } from '@nestjs/swagger';
import { ExchangeRate } from '../../../entities/exchange-rate.entity';

export class ExchangeRateResponseDto {
  @ApiProperty({ description: 'Rate ID' })
  id: number;

  @ApiProperty({ description: 'Exchange rate' })
  rate: number;

  @ApiProperty({ description: 'Set by user ID' })
  setByUserId: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(rate: ExchangeRate) {
    this.id = rate.id;
    this.rate = Number(rate.rate);
    this.setByUserId = rate.setByUserId;
    this.isActive = rate.isActive;
    this.createdAt = rate.createdAt;
  }
}
