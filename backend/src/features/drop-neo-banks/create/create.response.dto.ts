import { ApiProperty } from '@nestjs/swagger';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export class CreateDropNeoBankResponseDto {
  @ApiProperty({ description: 'Neo-bank ID' })
  id: number;

  @ApiProperty({ description: 'Provider (free-text bank name)', example: 'Ripio' })
  provider: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty({ enum: NeoBankStatus })
  status: NeoBankStatus;

  @ApiProperty({ required: false })
  alias?: string;

  @ApiProperty({ description: 'Current balance in ARS', example: 500000 })
  currentBalance: number;

  @ApiProperty({ description: 'Daily limit in ARS', required: false, example: 250000 })
  dailyLimit?: number;

  @ApiProperty({ description: 'Monthly limit in ARS', required: false, example: 2000000 })
  monthlyLimit?: number;

  @ApiProperty()
  drop: {
    id: number;
    name: string;
  };

  @ApiProperty({ required: false })
  platform?: {
    id: number;
    name: string;
  };

  @ApiProperty()
  createdAt: Date;

  constructor(dropNeoBank: DropNeoBank) {
    this.id = dropNeoBank.id;
    this.provider = dropNeoBank.provider;
    this.accountId = dropNeoBank.accountId;
    this.status = dropNeoBank.status;
    this.alias = dropNeoBank.alias;
    this.currentBalance = Number(dropNeoBank.currentBalance);
    this.dailyLimit = dropNeoBank.dailyLimit !== null && dropNeoBank.dailyLimit !== undefined ? Number(dropNeoBank.dailyLimit) : undefined;
    this.monthlyLimit = dropNeoBank.monthlyLimit !== null && dropNeoBank.monthlyLimit !== undefined ? Number(dropNeoBank.monthlyLimit) : undefined;
    this.drop = {
      id: dropNeoBank.drop.id,
      name: dropNeoBank.drop.name,
    };

    if (dropNeoBank.platform) {
      this.platform = {
        id: dropNeoBank.platform.id,
        name: dropNeoBank.platform.name,
      };
    }
    this.createdAt = dropNeoBank.createdAt;
  }
}
