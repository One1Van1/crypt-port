import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WithdrawSimpleProfitRequestDto {
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
    example: 1150.0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  adminRate: number;
}
