import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DirectConvertDto {
  @ApiProperty({
    description: 'Amount in pesos to convert',
    example: 100000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amountPesos: number;

  @ApiProperty({
    description: 'Exchange rate (pesos per USDT)',
    example: 1050.50,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  exchangeRate: number;

  @ApiProperty({
    description: 'Optional comment',
    example: 'Direct USDT conversion',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
