import { ApiProperty } from '@nestjs/swagger';
import { Shift } from '../../../entities/shift.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

class TransactionItemDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({
    enum: TransactionStatus,
    enumName: 'TransactionStatus',
    description: 'Transaction status',
  })
  status: TransactionStatus;

  @ApiProperty({ description: 'Bank account CBU' })
  bankAccountCbu: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.amount = Number(transaction.amount);
    this.status = transaction.status;
    this.bankAccountCbu = transaction.bankAccount?.cbu || 'Unknown';
    this.bankName = transaction.bankAccount?.bank?.name || 'Unknown';
    this.createdAt = transaction.createdAt;
  }
}

export class GetShiftByIdResponseDto {
  @ApiProperty({ description: 'Shift ID' })
  id: string;

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

  @ApiProperty({ description: 'Operator ID' })
  operatorId: string;

  @ApiProperty({ description: 'Operator username' })
  operatorUsername: string;

  @ApiProperty({ description: 'Platform ID' })
  platformId: string;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'List of transactions', type: [TransactionItemDto] })
  transactions: TransactionItemDto[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

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
    this.operatorId = shift.operator?.id;
    this.operatorUsername = shift.operator?.username || 'Unknown';
    this.platformId = shift.platform?.id;
    this.platformName = shift.platform?.name || 'Unknown';
    this.transactions = shift.transactions
      ? shift.transactions.map((t) => new TransactionItemDto(t))
      : [];
    this.createdAt = shift.createdAt;
    this.updatedAt = shift.updatedAt;
  }
}
