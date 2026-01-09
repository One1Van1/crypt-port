import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDropNeoBankFreezeHistoryQueryDto {
  @ApiProperty({ description: 'Neo-bank ID', example: 1 })
  @Type(() => Number)
  @IsNumber()
  neoBankId: number;

  @ApiProperty({ required: false, example: 50, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false, example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
