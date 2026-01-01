import { ApiProperty } from '@nestjs/swagger';

export class UpdateExchangeRateResponseDto {
  @ApiProperty({ description: 'Platform ID' })
  id: number;

  @ApiProperty({ description: 'Platform name' })
  name: string;

  @ApiProperty({ description: 'Updated exchange rate', example: 1150.50 })
  exchangeRate: number;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;

  constructor(id: number, name: string, exchangeRate: number, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.exchangeRate = exchangeRate;
    this.updatedAt = updatedAt;
  }
}
