import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlatformStatus } from '../../../common/enums/platform.enum';

export class GetAllPlatformsQueryDto {
  @ApiProperty({
    enum: PlatformStatus,
    enumName: 'PlatformStatus',
    description: 'Filter by platform status',
    required: false,
  })
  @IsOptional()
  @IsEnum(PlatformStatus)
  status?: PlatformStatus;

  @ApiProperty({
    description: 'Search by name',
    example: 'Binance',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
