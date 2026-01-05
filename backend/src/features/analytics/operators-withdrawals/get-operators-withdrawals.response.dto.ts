import { ApiProperty } from '@nestjs/swagger';

export class OperatorWithdrawalData {
  @ApiProperty({ description: 'Operator ID' })
  id: number;

  @ApiProperty({ description: 'Operator name' })
  name: string;

  @ApiProperty({ description: 'Total transactions count' })
  totalTransactions: number;

  @ApiProperty({ description: 'Completed transactions count' })
  completedTransactions: number;

  @ApiProperty({ description: 'Total withdrawn amount in ARS' })
  withdrawnAmount: number;

  @ApiProperty({ description: 'Withdrawal exchange rate' })
  withdrawalRate: number;

  @ApiProperty({ description: 'Bank account ID', nullable: true })
  bankId: number | null;

  @ApiProperty({ description: 'Amount in process (pending)' })
  inProcessAmount: number;

  @ApiProperty({ description: 'Current status' })
  status: string;

  @ApiProperty({ description: 'Total converted USDT amount' })
  convertedAmount: number;

  @ApiProperty({ description: 'Conversion exchange rate' })
  conversionRate: number;
}

export class GetOperatorsWithdrawalsResponseDto {
  @ApiProperty({ type: [OperatorWithdrawalData], description: 'Operators withdrawal data' })
  operators: OperatorWithdrawalData[];

  constructor(operators: OperatorWithdrawalData[]) {
    this.operators = operators;
  }
}
