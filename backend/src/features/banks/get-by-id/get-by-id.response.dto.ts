import { ApiProperty } from '@nestjs/swagger';
import { Bank } from '../../../entities/bank.entity';
import { BankStatus } from '../../../common/enums/bank.enum';

export class GetBankByIdResponseDto {
  @ApiProperty({ description: 'Bank ID' })
  id: string;

  @ApiProperty({ description: 'Bank name' })
  name: string;

  @ApiProperty({ description: 'Bank code', required: false })
  code: string | null;

  @ApiProperty({
    enum: BankStatus,
    enumName: 'BankStatus',
    description: 'Bank status',
  })
  status: BankStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(bank: Bank) {
    this.id = bank.id;
    this.name = bank.name;
    this.code = bank.code;
    this.status = bank.status;
    this.createdAt = bank.createdAt;
    this.updatedAt = bank.updatedAt;
  }
}
