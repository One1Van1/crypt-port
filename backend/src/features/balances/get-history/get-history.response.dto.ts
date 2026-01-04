import { ApiProperty } from '@nestjs/swagger';
import { Balance } from '../../../entities/balance.entity';

export class BalanceHistoryItemDto {
  @ApiProperty({ description: 'Balance ID' })
  id: number;

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Balance type' })
  type: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  constructor(balance: Balance) {
    this.id = balance.id;
    this.platformId = balance.platformId;
    this.platformName = balance.platform?.name || 'Unknown';
    this.amount = Number(balance.amount);
    this.currency = balance.currency;
    this.type = balance.type;
    this.description = balance.description || '';
    this.createdAt = balance.createdAt;
    this.updatedAt = balance.updatedAt;
  }
}

export class GetBalanceHistoryResponseDto {
  @ApiProperty({ description: 'Balance history items', type: [BalanceHistoryItemDto] })
  items: BalanceHistoryItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: Balance[], total: number) {
    this.items = items.map((balance) => new BalanceHistoryItemDto(balance));
    this.total = total;
  }
}
