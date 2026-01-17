import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class MintFreeUsdtRequestDto {
  @ApiProperty({
    description: 'Amount to add to free USDT balance',
    example: 100,
    minimum: 0.00000001,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.00000001)
  amountUsdt: number;
}
