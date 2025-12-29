import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../entities/transaction.entity';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class TransactionItemDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: number;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({
    enum: TransactionStatus,
    enumName: 'TransactionStatus',
    description: 'Transaction status',
  })
  status: TransactionStatus;

  @ApiProperty({ description: 'Comment', required: false })
  comment?: string;

  @ApiProperty({ description: 'Shift ID' })
  shiftId: number;

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
    this.comment = transaction.comment;
    this.shiftId = transaction.shift?.id;
    this.bankAccountCbu = transaction.bankAccount?.cbu || 'Unknown';
    this.bankName = transaction.bankAccount?.bank?.name || 'Unknown';
    this.createdAt = transaction.createdAt;
  }
}

export class GetMyTransactionsResponseDto {
  @ApiProperty({ description: 'List of transactions', type: [TransactionItemDto] })
  items: TransactionItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: TransactionItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
