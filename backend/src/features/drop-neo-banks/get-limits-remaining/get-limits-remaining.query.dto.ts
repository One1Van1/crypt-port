import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNeoBankLimitsRemainingQueryDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dropId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  platformId?: number;

  @ApiProperty({ required: false, example: 'ripio' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ required: false, example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
