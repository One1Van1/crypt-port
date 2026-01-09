import { ApiProperty } from '@nestjs/swagger';
import { DropNeoBankFreezeEvent } from '../../../entities/drop-neo-bank-freeze-event.entity';

export class FreezeHistoryUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false, nullable: true })
  email?: string | null;

  constructor(user: { id: number; username: string; email?: string | null }) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email ?? null;
  }
}

export class DropNeoBankFreezeHistoryItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: ['freeze', 'unfreeze'] })
  action: 'freeze' | 'unfreeze';

  @ApiProperty({ description: 'Frozen amount in ARS', example: 150000 })
  frozenAmount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: FreezeHistoryUserDto })
  performedByUser: FreezeHistoryUserDto;

  constructor(event: DropNeoBankFreezeEvent) {
    this.id = event.id;
    this.action = event.action;
    this.frozenAmount = Number(event.frozenAmount);
    this.createdAt = event.createdAt;
    this.performedByUser = new FreezeHistoryUserDto(event.performedByUser);
  }
}

export class GetDropNeoBankFreezeHistoryResponseDto {
  @ApiProperty({ type: [DropNeoBankFreezeHistoryItemDto] })
  items: DropNeoBankFreezeHistoryItemDto[];

  @ApiProperty()
  total: number;

  constructor(items: DropNeoBankFreezeEvent[], total: number) {
    this.items = items.map((e) => new DropNeoBankFreezeHistoryItemDto(e));
    this.total = total;
  }
}
