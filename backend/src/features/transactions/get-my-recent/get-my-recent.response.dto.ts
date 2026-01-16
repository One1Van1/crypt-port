import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../entities/transaction.entity';

class RecentBankDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'BBVA' })
  name: string;

  constructor(params: { id: number; name: string }) {
    this.id = params.id;
    this.name = params.name;
  }
}

class RecentDropDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Drop 1' })
  name: string;

  constructor(params: { id: number; name: string }) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class RecentTransactionItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  amount: number;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty({ type: RecentBankDto, required: false, nullable: true })
  bank?: RecentBankDto | null;

  @ApiProperty({ type: RecentDropDto, required: false, nullable: true })
  drop?: RecentDropDto | null;

  @ApiProperty({ example: '2026-01-16T10:00:00.000Z' })
  createdAt: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.amount = Number(transaction.amount);
    this.comment = transaction.comment ?? undefined;

    const bank = transaction.bankAccount?.bank;
    this.bank = bank ? new RecentBankDto({ id: bank.id, name: bank.name }) : null;

    const drop = transaction.bankAccount?.drop;
    this.drop = drop ? new RecentDropDto({ id: drop.id, name: drop.name }) : null;

    this.createdAt = transaction.createdAt;
  }
}

export class GetMyRecentTransactionsResponseDto {
  @ApiProperty({ type: RecentTransactionItemDto, isArray: true })
  items: RecentTransactionItemDto[];

  @ApiProperty({ example: 10 })
  total: number;

  constructor(params: { items: RecentTransactionItemDto[]; total: number }) {
    this.items = params.items;
    this.total = params.total;
  }
}
