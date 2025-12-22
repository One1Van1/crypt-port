import { ApiProperty } from '@nestjs/swagger';

export class OperatorStatsDto {
  @ApiProperty({ description: 'Operator ID' })
  operatorId: number;

  @ApiProperty({ description: 'Operator username' })
  operatorUsername: string;

  @ApiProperty({ description: 'Total completed shifts' })
  totalShifts: number;

  @ApiProperty({ description: 'Total duration in minutes' })
  totalDuration: number;

  @ApiProperty({ description: 'Total transactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'Completed transactions' })
  completedTransactions: number;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Completed amount' })
  completedAmount: number;

  @ApiProperty({ description: 'Success rate (%)' })
  successRate: number;

  @ApiProperty({ description: 'Average amount per transaction' })
  avgAmountPerTransaction: number;

  @ApiProperty({ description: 'Average shift duration (minutes)' })
  avgDuration: number;

  @ApiProperty({ description: 'Average transactions per shift' })
  avgTransactionsPerShift: number;

  constructor(data: {
    operatorId: number;
    operatorUsername: string;
    totalShifts: number;
    totalDuration: number;
    totalTransactions: number;
    completedTransactions: number;
    totalAmount: number;
    completedAmount: number;
    successRate: number;
    avgAmountPerTransaction: number;
    avgDuration: number;
    avgTransactionsPerShift: number;
  }) {
    this.operatorId = data.operatorId;
    this.operatorUsername = data.operatorUsername;
    this.totalShifts = data.totalShifts;
    this.totalDuration = data.totalDuration;
    this.totalTransactions = data.totalTransactions;
    this.completedTransactions = data.completedTransactions;
    this.totalAmount = Math.round(data.totalAmount * 100) / 100;
    this.completedAmount = Math.round(data.completedAmount * 100) / 100;
    this.successRate = Math.round(data.successRate * 100) / 100;
    this.avgAmountPerTransaction = Math.round(data.avgAmountPerTransaction * 100) / 100;
    this.avgDuration = Math.round(data.avgDuration);
    this.avgTransactionsPerShift = Math.round(data.avgTransactionsPerShift * 100) / 100;
  }
}

export class GetOperatorsAnalyticsResponseDto {
  @ApiProperty({ description: 'Operators statistics', type: [OperatorStatsDto] })
  operators: OperatorStatsDto[];

  constructor(operators: OperatorStatsDto[]) {
    this.operators = operators;
  }
}
