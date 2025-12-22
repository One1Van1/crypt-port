import { ApiProperty } from '@nestjs/swagger';
import { Bank } from '../../../entities/bank.entity';
import { BankStatus } from '../../../common/enums/bank.enum';

class BankItemDto {
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

  constructor(bank: Bank) {
    this.id = bank.id;
    this.name = bank.name;
    this.code = bank.code;
    this.status = bank.status;
    this.createdAt = bank.createdAt;
  }
}

export class GetAllBanksResponseDto {
  @ApiProperty({ description: 'List of banks', type: [BankItemDto] })
  items: BankItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(banks: Bank[], total: number) {
    this.items = banks.map((bank) => new BankItemDto(bank));
    this.total = total;
  }
}
