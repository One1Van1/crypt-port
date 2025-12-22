import { ApiProperty } from '@nestjs/swagger';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';

export class GetMyCurrentShiftResponseDto {
  @ApiProperty({ description: 'Shift ID' })
  id: number;

  @ApiProperty({ description: 'Shift start time' })
  startTime: Date;

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

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Current duration in minutes (calculated)' })
  currentDuration: number;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.startTime = shift.startTime;
    this.status = shift.status;
    this.totalAmount = Number(shift.totalAmount);
    this.operationsCount = shift.operationsCount;
    this.platformId = shift.platform?.id;
    this.platformName = shift.platform?.name;
    
    // Рассчитываем текущую продолжительность
    const now = new Date();
    const durationMs = now.getTime() - shift.startTime.getTime();
    this.currentDuration = Math.floor(durationMs / 60000); // в минутах
  }
}
