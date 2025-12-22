import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../../../entities/platform.entity';
import { PlatformStatus } from '../../../common/enums/platform.enum';

export class UpdatePlatformStatusResponseDto {
  @ApiProperty({ description: 'Platform ID' })
  id: number;

  @ApiProperty({ description: 'Platform name' })
  name: string;

  @ApiProperty({
    enum: PlatformStatus,
    enumName: 'PlatformStatus',
    description: 'Platform status',
  })
  status: PlatformStatus;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(platform: Platform) {
    this.id = platform.id;
    this.name = platform.name;
    this.status = platform.status;
    this.updatedAt = platform.updatedAt;
  }
}
