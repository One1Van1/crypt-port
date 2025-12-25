import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetAvailableBankAccountQueryDto {
  @ApiPropertyOptional({
    description: 'Required withdrawal amount (optional, for filtering)',
    example: 10000,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @IsInt()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Filter by specific bank ID (optional)',
    example: 6,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @IsInt()
  @Min(1)
  bankId?: number;
}
