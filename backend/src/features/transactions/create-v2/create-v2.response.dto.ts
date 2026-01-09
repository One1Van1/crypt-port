import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../entities/transaction.entity';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class CreateTransactionV2ResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: number;

  @ApiProperty({ description: 'Transaction amount (ARS)' })
  amount: number;

  @ApiProperty({ description: 'Transaction amount (USDT)' })
  amountUSDT: number;

  @ApiProperty({ description: 'Exchange rate used (ARS per 1 USDT)' })
  exchangeRate: number;

  @ApiProperty({
    enum: TransactionStatus,
    enumName: 'TransactionStatus',
    description: 'Transaction status',
  })
  status: TransactionStatus;

  @ApiProperty({ description: 'Shift ID' })
  shiftId: number;

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Target bank account ID' })
  bankAccountId: number;

  @ApiProperty({ description: 'Source neo-bank ID' })
  sourceDropNeoBankId: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.amount = Number(transaction.amount);
    this.amountUSDT = Number(transaction.amountUSDT);
    this.exchangeRate = Number(transaction.exchangeRate);
    this.status = transaction.status;
    this.shiftId = transaction.shift?.id;
    this.platformId = transaction.platform?.id;
    this.bankAccountId = transaction.bankAccount?.id;
    this.sourceDropNeoBankId = transaction.sourceDropNeoBank?.id;
    this.createdAt = transaction.createdAt;
  }
}
