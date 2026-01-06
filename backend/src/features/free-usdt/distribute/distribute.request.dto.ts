import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DistributeFreeUsdtRequestDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  platformId: number;

  @ApiProperty({ example: 50, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amountUsdt: number;

  @ApiProperty({ required: false, example: 'Redistribution to platform' })
  @IsOptional()
  @IsString()
  comment?: string;
}
