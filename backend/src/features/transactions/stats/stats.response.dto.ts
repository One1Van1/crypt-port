import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionsStatsResponseDto {
  @ApiProperty({ description: 'Total number of transactions' })
  total: number;

  @ApiProperty({ description: 'Number of completed transactions' })
  completed: number;

  @ApiProperty({ description: 'Number of pending transactions' })
  pending: number;

  @ApiProperty({ description: 'Number of failed transactions' })
  failed: number;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Completed amount' })
  completedAmount: number;

  @ApiProperty({ description: 'Pending amount' })
  pendingAmount: number;

  @ApiProperty({ description: 'Average amount per transaction' })
  avgAmount: number;

  @ApiProperty({ description: 'Success rate (completed / total) in percentage' })
  successRate: number;

  constructor(data: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalAmount: number;
    completedAmount: number;
    pendingAmount: number;
    avgAmount: number;
    successRate: number;
  }) {
    this.total = data.total;
    this.completed = data.completed;
    this.pending = data.pending;
    this.failed = data.failed;
    this.totalAmount = Math.round(data.totalAmount * 100) / 100;
    this.completedAmount = Math.round(data.completedAmount * 100) / 100;
    this.pendingAmount = Math.round(data.pendingAmount * 100) / 100;
    this.avgAmount = Math.round(data.avgAmount * 100) / 100;
    this.successRate = Math.round(data.successRate * 100) / 100;
  }
}
