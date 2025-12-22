import { ApiProperty } from '@nestjs/swagger';
import { Balance } from '../../../entities/balance.entity';
import { BalanceType } from '../../../common/enums/balance.enum';

export class UpdateBalanceResponseDto {
  @ApiProperty({ description: 'Balance ID' })
  id: number;

  @ApiProperty({ description: 'Updated balance amount' })
  amount: number;

  @ApiProperty({
    enum: BalanceType,
    enumName: 'BalanceType',
    description: 'Balance type',
  })
  type: BalanceType;

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(balance: Balance) {
    this.id = balance.id;
    this.amount = Number(balance.amount);
    this.type = balance.type;
    this.platformId = balance.platform?.id;
    this.platformName = balance.platform?.name || 'Unknown';
    this.updatedAt = balance.updatedAt;
  }
}
