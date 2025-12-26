import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAvailableBankAccountQueryDto {
  @ApiProperty({
    description: 'Required withdrawal amount (optional, for filtering)',
    example: 10000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({
    description: 'Filter by specific bank ID (optional)',
    example: 6,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  bankId?: number;
}
