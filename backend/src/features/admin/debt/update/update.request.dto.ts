import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDebtRequestDto {
  @ApiProperty({ example: 0, description: 'New debt amount (USDT)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountUsdt: number;

  @ApiProperty({ required: false, example: 'Set to zero' })
  @IsOptional()
  @IsString()
  comment?: string;
}
