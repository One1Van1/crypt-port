import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../entities/transaction.entity';

export class CreateTransactionV3ResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10000 })
  amount: number;

  @ApiProperty({ example: 9.0909 })
  amountUSDT: number;

  @ApiProperty({ example: 1100 })
  exchangeRate: number;

  @ApiProperty({ example: 1 })
  platformId: number;

  @ApiProperty({ example: 1 })
  shiftId: number;

  @ApiProperty({ example: 1 })
  bankAccountId: number;

  @ApiProperty({ example: 1 })
  sourceDropNeoBankId: number;

  constructor(transaction: Transaction | null) {
    this.id = transaction?.id;
    this.amount = Number(transaction?.amount ?? 0);
    this.amountUSDT = Number(transaction?.amountUSDT ?? 0);
    this.exchangeRate = Number(transaction?.exchangeRate ?? 0);
    this.platformId = transaction?.platform?.id;
    this.shiftId = transaction?.shift?.id;
    this.bankAccountId = transaction?.bankAccount?.id;
    this.sourceDropNeoBankId = transaction?.sourceDropNeoBank?.id;
  }
}
