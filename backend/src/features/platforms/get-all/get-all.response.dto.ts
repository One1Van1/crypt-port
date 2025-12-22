import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../../../entities/platform.entity';
import { PlatformStatus } from '../../../common/enums/platform.enum';

class PlatformItemDto {
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

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(platform: Platform) {
    this.id = platform.id;
    this.name = platform.name;
    this.status = platform.status;
    this.createdAt = platform.createdAt;
  }
}

export class GetAllPlatformsResponseDto {
  @ApiProperty({ description: 'List of platforms', type: [PlatformItemDto] })
  items: PlatformItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(platforms: Platform[], total: number) {
    this.items = platforms.map((platform) => new PlatformItemDto(platform));
    this.total = total;
  }
}
