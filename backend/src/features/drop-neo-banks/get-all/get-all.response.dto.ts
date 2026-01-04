import { ApiProperty } from '@nestjs/swagger';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { NeoBankProvider, NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export class DropNeoBankItemDto {
  @ApiProperty({ description: 'Neo-bank ID' })
  id: number;

  @ApiProperty({ enum: NeoBankProvider })
  provider: NeoBankProvider;

  @ApiProperty()
  accountId: string;

  @ApiProperty({ enum: NeoBankStatus })
  status: NeoBankStatus;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty({ description: 'Current balance in ARS', example: 500000 })
  currentBalance: number;

  @ApiProperty({ required: false })
  drop?: {
    id: number;
    name: string;
    status: string;
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
    this.comment = dropNeoBank.comment;
    this.currentBalance = Number(dropNeoBank.currentBalance);
    
    if (dropNeoBank.drop) {
      this.drop = {
        id: dropNeoBank.drop.id,
        name: dropNeoBank.drop.name,
        status: dropNeoBank.drop.status,
      };
    }
    
    if (dropNeoBank.platform) {
      this.platform = {
        id: dropNeoBank.platform.id,
        name: dropNeoBank.platform.name,
      };
    }
    
    this.createdAt = dropNeoBank.createdAt;
  }
}

export class GetAllDropNeoBanksResponseDto {
  @ApiProperty({ type: [DropNeoBankItemDto] })
  items: DropNeoBankItemDto[];

  constructor(items: DropNeoBank[]) {
    this.items = items.map((item) => new DropNeoBankItemDto(item));
  }
}
