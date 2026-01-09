import { ApiProperty } from '@nestjs/swagger';

export class NeoBankWithdrawalsHistoryUserDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'admin@example.com', required: false, nullable: true })
  email?: string | null;

  constructor(params: { id: number; username: string; email?: string | null }) {
    this.id = params.id;
    this.username = params.username;
    this.email = params.email ?? null;
  }
}

export class NeoBankWithdrawalsHistoryItemDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: 12345 })
  transactionId: number;

  @ApiProperty({ type: String, example: '2026-01-09T12:34:56.000Z' })
  createdAt: string;

  @ApiProperty({ type: NeoBankWithdrawalsHistoryUserDto })
  withdrawnByUser: NeoBankWithdrawalsHistoryUserDto;

  constructor(params: {
    id: number;
    amount: number;
    transactionId: number;
    createdAt: string;
    withdrawnByUser: NeoBankWithdrawalsHistoryUserDto;
  }) {
    this.id = params.id;
    this.amount = params.amount;
    this.transactionId = params.transactionId;
    this.createdAt = params.createdAt;
    this.withdrawnByUser = params.withdrawnByUser;
  }
}

export class GetNeoBankWithdrawalsHistoryResponseDto {
  @ApiProperty({ type: [NeoBankWithdrawalsHistoryItemDto] })
  items: NeoBankWithdrawalsHistoryItemDto[];

  @ApiProperty({ example: 100 })
  total: number;

  constructor(items: NeoBankWithdrawalsHistoryItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
