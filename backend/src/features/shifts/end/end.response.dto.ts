import { ApiProperty } from '@nestjs/swagger';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';

export class EndShiftResponseDto {
  @ApiProperty({ description: 'Shift ID' })
  id: number;

  @ApiProperty({ description: 'Shift start time' })
  startTime: Date;

  @ApiProperty({ description: 'Shift end time' })
  endTime: Date;

  @ApiProperty({ description: 'Duration in minutes' })
  duration: number;

  @ApiProperty({
    enum: ShiftStatus,
    enumName: 'ShiftStatus',
    description: 'Shift status',
  })
  status: ShiftStatus;

  @ApiProperty({ description: 'Total amount withdrawn during shift' })
  totalAmount: number;

  @ApiProperty({ description: 'Number of operations during shift' })
  operationsCount: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Number of transactions' })
  transactionsCount: number;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.startTime = shift.startTime;
    this.endTime = shift.endTime;
    this.duration = shift.duration;
    this.status = shift.status;
    this.totalAmount = Number(shift.totalAmount);
    this.operationsCount = shift.operationsCount;
    this.platformName = shift.platform?.name;
    this.transactionsCount = shift.transactions?.length || 0;
    this.updatedAt = shift.updatedAt;
  }
}
