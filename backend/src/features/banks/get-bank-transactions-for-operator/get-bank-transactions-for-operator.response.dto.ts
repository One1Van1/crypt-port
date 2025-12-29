import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class TransactionForOperatorDto {
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

  @ApiProperty({ description: 'Drop name' })
  dropName: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class GetBankTransactionsForOperatorResponseDto {
  @ApiProperty({ type: [TransactionForOperatorDto], description: 'Transactions list' })
  items: TransactionForOperatorDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: TransactionForOperatorDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
