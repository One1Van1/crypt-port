import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDebtRequestDto {
  @ApiProperty({ example: 1000, description: 'Debt amount (USDT)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountUsdt: number;

  @ApiProperty({ required: false, example: 'Manual set' })
  @IsOptional()
  @IsString()
  comment?: string;
}
