import { IsNumber, IsPositive, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WithdrawProfitRequestDto {
  @ApiProperty({
    description: 'Amount of profit USDT to withdraw',
    example: 9.09,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  profitUsdtAmount: number;

  @ApiProperty({
    description: 'Admin withdrawal rate (ARS per 1 USDT)',
    example: 1150.00,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  adminRate: number;

  @ApiProperty({
    description: 'Section to return the principal amount to',
    enum: ['blocked_pesos', 'unpaid_pesos'],
    example: 'unpaid_pesos',
  })
  @IsEnum(['blocked_pesos', 'unpaid_pesos'])
  returnedToSection: 'blocked_pesos' | 'unpaid_pesos';
}
