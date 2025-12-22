import { ApiProperty } from '@nestjs/swagger';
import { Drop } from '../../../entities/drop.entity';
import { DropStatus } from '../../../common/enums/drop.enum';

export class UpdateDropStatusResponseDto {
  @ApiProperty({ description: 'Drop ID' })
  id: string;

  @ApiProperty({ description: 'Drop name' })
  name: string;

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
    this.status = drop.status;
    this.updatedAt = drop.updatedAt;
  }
}
