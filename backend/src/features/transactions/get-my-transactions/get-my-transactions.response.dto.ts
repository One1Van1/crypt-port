import { ApiProperty } from '@nestjs/swagger';
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
}

class PlatformDto {
  @ApiProperty({ description: 'Platform ID' })
  id: number;

  @ApiProperty({ description: 'Platform name' })
  name: string;
}

class BankAccountDto {
  @ApiProperty({ description: 'Bank account CBU' })
  cbu: string;
}

class DropDto {
  @ApiProperty({ description: 'Drop ID' })
  id: number;

  @ApiProperty({ description: 'Drop name' })
  name: string;
}

export class TransactionItemDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: number;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  status: TransactionStatus;

  @ApiProperty({ description: 'Physical bank', type: BankDto, nullable: true })
  bank: BankDto | null;

  @ApiProperty({ description: 'User', type: UserDto, nullable: true })
  user: UserDto | null;

  @ApiProperty({ description: 'Platform', type: PlatformDto, nullable: true })
  platform: PlatformDto | null;

  @ApiProperty({ description: 'Bank account info', type: BankAccountDto, nullable: true })
  bankAccount: BankAccountDto | null;

  @ApiProperty({ description: 'Drop info', type: DropDto, nullable: true })
  drop: DropDto | null;

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
