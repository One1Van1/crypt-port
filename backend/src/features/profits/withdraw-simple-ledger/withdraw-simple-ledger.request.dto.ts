import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WithdrawSimpleLedgerProfitRequestDto {
  @ApiProperty({ example: 10, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  profitUsdtAmount: number;

  @ApiProperty({ example: 1100, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  adminRate: number;
}
