import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class WithdrawCashV2Dto {
  @ApiProperty({
    description: 'Bank account ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bankAccountId: number;

  @ApiProperty({
    description: 'Amount in pesos',
    example: 100000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amountPesos: number;

  @ApiProperty({
    description: 'Manual exchange rate (ARS per 1 USDT)',
    example: 1000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  withdrawalRate: number;

  @ApiProperty({
    description: 'Comment',
    example: 'Cash withdrawal for conversion',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
