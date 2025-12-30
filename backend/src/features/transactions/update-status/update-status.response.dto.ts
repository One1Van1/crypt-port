import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../entities/transaction.entity';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class UpdateTransactionStatusResponseDto {
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

  @ApiProperty({ description: 'Shift ID' })
  shiftId: number;

  @ApiProperty({ description: 'Bank account CBU' })
  bankAccountCbu: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Drop full name' })
  dropName: string;

  @ApiProperty({ description: 'Operator username' })
  operatorUsername: string;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.amount = Number(transaction.amount);
    this.status = transaction.status;
    this.shiftId = transaction.shift?.id;
    this.bankAccountCbu = transaction.bankAccount?.cbu || 'Unknown';
    this.bankName = transaction.bankAccount?.bank?.name || 'Unknown';
    this.dropName = transaction.bankAccount?.drop?.name || 'Unknown';
    this.operatorUsername = transaction.user?.username || 'Unknown';
    this.updatedAt = transaction.updatedAt;
  }
}
