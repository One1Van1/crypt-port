import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class DropTransactionForOperatorDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: number;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({ description: 'Amount in USDT', required: false })
  amountUSDT: number | null;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  status: TransactionStatus;

  @ApiProperty({ description: 'Comment', required: false })
  comment: string | null;

  @ApiProperty({ description: 'Bank account CBU' })
  bankAccountCbu: string;

  @ApiProperty({ description: 'Bank account alias' })
  bankAccountAlias: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class GetDropTransactionsForOperatorResponseDto {
  @ApiProperty({ type: [DropTransactionForOperatorDto], description: 'Transactions list' })
  items: DropTransactionForOperatorDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: DropTransactionForOperatorDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
