import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class TransactionItemDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  status: TransactionStatus;

  @ApiProperty({ description: 'Operator ID' })
  operatorId: string;

  @ApiProperty({ description: 'Operator username', nullable: true })
  operatorUsername: string | null;

  @ApiProperty({ description: 'Platform ID', nullable: true })
  platformId: number | null;

  @ApiProperty({ description: 'Platform name', nullable: true })
  platformName: string | null;

  @ApiProperty({ description: 'Shift ID', nullable: true })
  shiftId: string | null;

  @ApiProperty({ description: 'Bank account ID', nullable: true })
  bankAccountId: string | null;

  @ApiProperty({ description: 'Bank account number', nullable: true })
  bankAccountNumber: string | null;

  @ApiProperty({ description: 'Bank name', nullable: true })
  bankName: string | null;

  @ApiProperty({ description: 'Drop name', nullable: true })
  dropName: string | null;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class GetMyTransactionsResponseDto {
  @ApiProperty({ type: [TransactionItemDto], description: 'List of transactions' })
  items: TransactionItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: TransactionItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
