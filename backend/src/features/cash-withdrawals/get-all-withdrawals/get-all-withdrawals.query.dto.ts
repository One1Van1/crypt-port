import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllWithdrawalsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by date (YYYY-MM-DD). Returns withdrawals from start of this date to start of next date',
    example: '2026-01-05',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
