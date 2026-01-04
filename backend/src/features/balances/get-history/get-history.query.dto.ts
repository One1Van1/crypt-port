import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetBalanceHistoryQueryDto {
  @ApiProperty({
    description: 'Platform ID to filter by',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  platformId?: number;

  @ApiProperty({
    description: 'Number of records to return',
    example: 50,
    minimum: 1,
    maximum: 200,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;
}
