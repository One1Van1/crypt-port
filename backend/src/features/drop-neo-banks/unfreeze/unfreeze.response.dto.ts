import { ApiProperty } from '@nestjs/swagger';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export class UnfreezeDropNeoBankResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: NeoBankStatus })
  status: NeoBankStatus;

  @ApiProperty({ description: 'Frozen amount in ARS', example: 0 })
  frozenAmount: number;

  @ApiProperty()
  updatedAt: Date;

  constructor(dto: { id: number; status: NeoBankStatus; frozenAmount: number; updatedAt: Date }) {
    this.id = dto.id;
    this.status = dto.status;
    this.frozenAmount = dto.frozenAmount;
    this.updatedAt = dto.updatedAt;
  }
}
