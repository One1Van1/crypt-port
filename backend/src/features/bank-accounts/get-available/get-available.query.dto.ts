import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAvailableBankAccountQueryDto {
  @ApiProperty({
    description: 'Required withdrawal amount',
    example: 10000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Filter by specific bank ID (optional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  bankId?: string;
}
