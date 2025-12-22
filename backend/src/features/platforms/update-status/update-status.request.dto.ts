import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlatformStatus } from '../../../common/enums/platform.enum';

export class UpdatePlatformStatusRequestDto {
  @ApiProperty({
    enum: PlatformStatus,
    enumName: 'PlatformStatus',
    description: 'New platform status',
    example: PlatformStatus.ACTIVE,
  })
  @IsEnum(PlatformStatus)
  status: PlatformStatus;
}
