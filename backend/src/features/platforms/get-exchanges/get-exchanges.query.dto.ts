import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetPlatformExchangesQueryDto {
  @ApiProperty({ required: false, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiProperty({ required: false, example: 1, minimum: 1, description: 'Filter by platform id' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  platformId?: number;
}
