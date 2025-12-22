import { ApiProperty } from '@nestjs/swagger';
import { Drop } from '../../../entities/drop.entity';
import { DropStatus } from '../../../common/enums/drop.enum';

class DropItemDto {
  @ApiProperty({ description: 'Drop ID' })
  id: string;

  @ApiProperty({ description: 'Drop name' })
  name: string;

  @ApiProperty({ description: 'Comment', required: false })
  comment: string | null;

  @ApiProperty({
    enum: DropStatus,
    enumName: 'DropStatus',
    description: 'Drop status',
  })
  status: DropStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(drop: Drop) {
    this.id = drop.id;
    this.name = drop.name;
    this.comment = drop.comment;
    this.status = drop.status;
    this.createdAt = drop.createdAt;
  }
}

export class GetAllDropsResponseDto {
  @ApiProperty({ description: 'List of drops', type: [DropItemDto] })
  items: DropItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(drops: Drop[], total: number) {
    this.items = drops.map((drop) => new DropItemDto(drop));
    this.total = total;
  }
}
