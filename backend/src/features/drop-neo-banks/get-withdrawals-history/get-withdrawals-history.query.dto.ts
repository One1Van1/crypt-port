import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetNeoBankWithdrawalsHistoryQueryDto {
  @ApiProperty({
    description: 'Neo-bank ID',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  neoBankId: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Offset for pagination',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
