import { ApiProperty } from '@nestjs/swagger';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';

export class StartShiftResponseDto {
  @ApiProperty({ description: 'Shift ID' })
  id: string;

  @ApiProperty({ description: 'Shift start time' })
  startTime: Date;

  @ApiProperty({
    enum: ShiftStatus,
    enumName: 'ShiftStatus',
    description: 'Shift status',
  })
  status: ShiftStatus;

  @ApiProperty({ description: 'Platform ID' })
  platformId: string;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Operator ID' })
  operatorId: string;

  @ApiProperty({ description: 'Operator username' })
  operatorUsername: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.startTime = shift.startTime;
    this.status = shift.status;
    this.platformId = shift.platform?.id;
    this.platformName = shift.platform?.name;
    this.operatorId = shift.operator?.id;
    this.operatorUsername = shift.operator?.username;
    this.createdAt = shift.createdAt;
  }
}
