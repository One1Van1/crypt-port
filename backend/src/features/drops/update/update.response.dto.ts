import { ApiProperty } from '@nestjs/swagger';
import { Drop } from '../../../entities/drop.entity';
import { DropStatus } from '../../../common/enums/drop.enum';

export class UpdateDropResponseDto {
  @ApiProperty({ description: 'Drop ID' })
  id: number;

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

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(drop: Drop) {
    this.id = drop.id;
    this.name = drop.name;
    this.comment = drop.comment;
    this.status = drop.status;
    this.updatedAt = drop.updatedAt;
  }
}
