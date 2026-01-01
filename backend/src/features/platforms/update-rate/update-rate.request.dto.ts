import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExchangeRateRequestDto {
  @ApiProperty({
    description: 'Exchange rate (1 USDT = X ARS)',
    example: 1150.50,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  exchangeRate: number;
}
