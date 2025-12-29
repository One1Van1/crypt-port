import { ApiProperty } from '@nestjs/swagger';
import { DropStatus } from '../../../common/enums/drop.enum';

export class BankForDropDto {
  @ApiProperty({ description: 'Bank ID' })
  id: number;

  @ApiProperty({ description: 'Bank name' })
  name: string;

  @ApiProperty({ description: 'Bank code', required: false })
  code: string | null;
}

export class OperatorDropDto {
  @ApiProperty({ description: 'Drop ID' })
  id: number;

  @ApiProperty({ description: 'Drop name' })
  name: string;

  @ApiProperty({ description: 'Drop comment', required: false })
  comment: string | null;

  @ApiProperty({ enum: DropStatus, description: 'Drop status' })
  status: DropStatus;

  @ApiProperty({ description: 'Number of active accounts in this drop' })
  accountsCount: number;

  @ApiProperty({ type: [BankForDropDto], description: 'Banks used in this drop' })
  banks: BankForDropDto[];
}

export class GetOperatorDropsResponseDto {
  @ApiProperty({ type: [OperatorDropDto], description: 'List of drops' })
  drops: OperatorDropDto[];

  constructor(drops: OperatorDropDto[]) {
    this.drops = drops;
  }
}
