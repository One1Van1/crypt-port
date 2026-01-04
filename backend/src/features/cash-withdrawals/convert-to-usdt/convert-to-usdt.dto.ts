import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertToUsdtDto {
  @ApiProperty({
    description: 'Exchange rate for conversion (ARS per 1 USDT)',
    example: 1100.00,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  exchangeRate: number;
}
