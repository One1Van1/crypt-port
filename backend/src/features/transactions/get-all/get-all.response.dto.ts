import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../entities/transaction.entity';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

class BankDto {
  @ApiProperty({ description: 'Bank ID' })
  id: number;

  @ApiProperty({ description: 'Bank name' })
  name: string;
}

class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;
}

class PlatformDto {
  @ApiProperty({ description: 'Platform ID' })
  id: number;

  @ApiProperty({ description: 'Platform name' })
  name: string;
}

class DropNeoBankDto {
  @ApiProperty({ description: 'Drop Neo Bank ID' })
  id: number;

  @ApiProperty({ description: 'Provider' })
  provider: string;

  @ApiProperty({ description: 'Account ID' })
  accountId: string;
}

class BankAccountDto {
  @ApiProperty({ description: 'Bank account CBU' })
  cbu: string;
}

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

  @ApiProperty({ description: 'Physical bank', type: BankDto })
  bank: BankDto;

  @ApiProperty({ description: 'User who created transaction', type: UserDto })
  user: UserDto;

  @ApiProperty({ description: 'Platform', type: PlatformDto })
  platform: PlatformDto;

  @ApiProperty({ description: 'Withdrawal bank (Drop Neo Bank)', type: DropNeoBankDto, required: false })
  dropNeoBank?: DropNeoBankDto;

  @ApiProperty({ description: 'Bank account info', type: BankAccountDto })
  bankAccount: BankAccountDto;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.amount = Number(transaction.amount);
    this.status = transaction.status;
    this.bank = transaction.bankAccount?.bank 
      ? { id: transaction.bankAccount.bank.id, name: transaction.bankAccount.bank.name }
      : { id: 0, name: 'Неизвестный банк' };
    this.user = transaction.user
      ? { id: transaction.user.id, username: transaction.user.username, email: transaction.user.email }
      : { id: 0, username: 'Неизвестный', email: '' };
    this.platform = transaction.shift?.platform
      ? { id: transaction.shift.platform.id, name: transaction.shift.platform.name }
      : { id: 0, name: 'Неизвестная площадка' };
    this.dropNeoBank = transaction.sourceDropNeoBank
      ? { id: transaction.sourceDropNeoBank.id, provider: transaction.sourceDropNeoBank.provider, accountId: transaction.sourceDropNeoBank.accountId }
      : undefined;
    this.bankAccount = { cbu: transaction.bankAccount?.cbu || '' };
    this.createdAt = transaction.createdAt;
  }
}

export class GetAllTransactionsResponseDto {
  @ApiProperty({ description: 'List of transactions', type: [TransactionItemDto] })
  items: TransactionItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: TransactionItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
