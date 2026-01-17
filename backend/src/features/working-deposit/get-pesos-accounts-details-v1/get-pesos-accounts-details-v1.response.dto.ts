import { ApiProperty } from '@nestjs/swagger';

export class PesosAccountDetailsV1ItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'bank_account' })
  type: string;

  @ApiProperty({ example: 'DROP1.NACION.1 - 000000...' })
  identifier: string;

  @ApiProperty({ example: 'Nacion' })
  bankName: string;

  @ApiProperty({ example: 'DROP1' })
  dropName: string;

  @ApiProperty({ example: 434.39 })
  balanceUsdt: number;

  constructor(params: {
    id: number;
    type: string;
    identifier: string;
    bankName: string;
    dropName: string;
    balanceUsdt: number;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.identifier = params.identifier;
    this.bankName = params.bankName;
    this.dropName = params.dropName;
    this.balanceUsdt = params.balanceUsdt;
  }
}

export class GetPesosAccountsDetailsV1ResponseDto {
  @ApiProperty({ type: [PesosAccountDetailsV1ItemDto] })
  items: PesosAccountDetailsV1ItemDto[];

  constructor(items: PesosAccountDetailsV1ItemDto[]) {
    this.items = items;
  }
}
