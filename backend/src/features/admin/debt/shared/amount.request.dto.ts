import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DebtAmountChangeRequestDto {
  @ApiProperty({ example: 100, description: 'Amount (USDT) to increase/decrease by' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.00000001)
  amountUsdt: number;

  @ApiProperty({ required: false, example: 'Manual adjust' })
  @IsOptional()
  @IsString()
  comment?: string;
}
