import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WithdrawSimpleLedgerV2ProfitRequestDto {
  @ApiProperty({ example: 94.44, description: 'USDT amount to withdraw from today\'s profit reserve' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  profitUsdtAmount: number;

  @ApiProperty({ example: 1000, description: 'Admin exchange rate ARS/USDT used for ARS receipt' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  adminRate: number;
}
