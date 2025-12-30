import { ApiProperty } from '@nestjs/swagger';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';

class OperatorDto {
  @ApiProperty({ description: 'Operator ID' })
  id: number;

  @ApiProperty({ description: 'Operator username' })
  username: string;

  @ApiProperty({ description: 'Operator email' })
  email: string;
}

class PlatformDto {
  @ApiProperty({ description: 'Platform ID' })
  id: number;

  @ApiProperty({ description: 'Platform name' })
  name: string;
}

class ShiftItemDto {
  @ApiProperty({ description: 'Shift ID' })
  id: number;

  @ApiProperty({ description: 'Shift start time' })
  startTime: Date;

  @ApiProperty({ description: 'Shift end time', required: false })
  endTime: Date | null;

  @ApiProperty({ description: 'Duration in minutes', required: false })
  duration: number | null;

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

  @ApiProperty({ description: 'Operator information', type: OperatorDto })
  operator: OperatorDto;

  @ApiProperty({ description: 'Platform information', type: PlatformDto })
  platform: PlatformDto;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.startTime = shift.startTime;
    this.endTime = shift.endTime;
    this.duration = shift.duration;
    this.status = shift.status;
    this.totalAmount = Number(shift.totalAmount);
    this.operationsCount = shift.operationsCount;
    this.operator = {
      id: shift.user?.id || 0,
      username: shift.user?.username || 'Unknown',
      email: shift.user?.email || '',
    };
    this.platform = {
      id: shift.platform?.id || 0,
      name: shift.platform?.name || 'Unknown',
    };
    this.createdAt = shift.createdAt;
  }
}

export class GetAllShiftsResponseDto {
  @ApiProperty({ description: 'List of shifts', type: [ShiftItemDto] })
  items: ShiftItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(shifts: Shift[], total: number) {
    this.items = shifts.map((shift) => new ShiftItemDto(shift));
    this.total = total;
  }
}
