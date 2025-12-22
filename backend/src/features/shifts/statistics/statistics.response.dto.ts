import { ApiProperty } from '@nestjs/swagger';

export class GetShiftsStatisticsResponseDto {
  @ApiProperty({ description: 'Total number of completed shifts' })
  totalShifts: number;

  @ApiProperty({ description: 'Total duration in minutes' })
  totalDuration: number;

  @ApiProperty({ description: 'Total amount withdrawn' })
  totalAmount: number;

  @ApiProperty({ description: 'Total number of operations' })
  totalOperations: number;

  @ApiProperty({ description: 'Average duration per shift (minutes)' })
  avgDuration: number;

  @ApiProperty({ description: 'Average amount per shift' })
  avgAmount: number;

  @ApiProperty({ description: 'Average operations per shift' })
  avgOperations: number;

  @ApiProperty({ description: 'Average amount per hour' })
  avgAmountPerHour: number;

  constructor(data: {
    totalShifts: number;
    totalDuration: number;
    totalAmount: number;
    totalOperations: number;
    avgDuration: number;
    avgAmount: number;
    avgOperations: number;
    avgAmountPerHour: number;
  }) {
    this.totalShifts = data.totalShifts;
    this.totalDuration = data.totalDuration;
    this.totalAmount = data.totalAmount;
    this.totalOperations = data.totalOperations;
    this.avgDuration = Math.round(data.avgDuration);
    this.avgAmount = Math.round(data.avgAmount * 100) / 100;
    this.avgOperations = Math.round(data.avgOperations * 100) / 100;
    this.avgAmountPerHour = Math.round(data.avgAmountPerHour * 100) / 100;
  }
}
