import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ExchangeUsdtToPesosRequestDto {
  @ApiProperty({
    description: 'Platform ID to withdraw USDT from',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  platformId: number;

  @ApiProperty({
    description: 'Neo Bank ID to deposit pesos to',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  neoBankId: number;

  @ApiProperty({
    description: 'Amount of USDT to exchange',
    example: 100.50,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  usdtAmount: number;

  @ApiProperty({
    description: 'Exchange rate (ARS per 1 USDT) set by admin',
    example: 1050.75,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  exchangeRate: number;
}
