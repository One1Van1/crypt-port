import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetExchangeRateDto {
  @ApiProperty({
    description: 'Exchange rate (ARS per 1 USDT)',
    example: 1050.00,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  rate: number;
}
