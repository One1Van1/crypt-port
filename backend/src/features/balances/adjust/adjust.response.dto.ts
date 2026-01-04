import { ApiProperty } from '@nestjs/swagger';
import { Balance } from '../../../entities/balance.entity';

export class AdjustBalanceResponseDto {
  @ApiProperty({ description: 'Balance ID' })
  id: number;

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Previous amount' })
  previousAmount: number;

  @ApiProperty({ description: 'Adjustment' })
  adjustment: number;

  @ApiProperty({ description: 'New amount' })
  newAmount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Balance type' })
  type: string;

  constructor(balance: Balance, previousAmount: number, adjustment: number) {
    this.id = balance.id;
    this.platformId = balance.platformId;
    this.platformName = balance.platform?.name || 'Unknown';
    this.previousAmount = previousAmount;
    this.adjustment = adjustment;
    this.newAmount = Number(balance.amount);
    this.currency = balance.currency;
    this.type = balance.type;
  }
}
