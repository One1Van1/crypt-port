import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ReserveProfitRequestDto {
  @ApiProperty({
    description: 'Date to reserve profit/deficit for (YYYY-MM-DD). Defaults to today (server time).',
    example: '2026-01-06',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
