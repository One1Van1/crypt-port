import { ApiProperty } from '@nestjs/swagger';

export class SearchNeoBanksV3ItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'satoshi_tango' })
  provider: string;

  @ApiProperty({ example: '3344556677889900' })
  accountId: string;

  @ApiProperty({ example: 'BYBIT.SATOSHI.1', required: false, nullable: true })
  alias?: string | null;

  @ApiProperty({ example: 500000, required: false, nullable: true })
  dailyLimit?: number | null;

  @ApiProperty({ example: 4549838, required: false, nullable: true })
  monthlyLimit?: number | null;

  @ApiProperty({ example: 1 })
  dropId: number;

  @ApiProperty({ example: 'Drop 1' })
  dropName: string;

  constructor(params: {
    id: number;
    provider: string;
    accountId: string;
    alias?: string | null;
    dailyLimit?: number | null;
    monthlyLimit?: number | null;
    dropId: number;
    dropName: string;
  }) {
    this.id = params.id;
    this.provider = params.provider;
    this.accountId = params.accountId;
    this.alias = params.alias;
    this.dailyLimit = params.dailyLimit;
    this.monthlyLimit = params.monthlyLimit;
    this.dropId = params.dropId;
    this.dropName = params.dropName;
  }
}

export class SearchNeoBanksV3ResponseDto {
  @ApiProperty({ type: SearchNeoBanksV3ItemDto, isArray: true })
  items: SearchNeoBanksV3ItemDto[];

  @ApiProperty({ example: 2 })
  total: number;

  constructor(params: { items: SearchNeoBanksV3ItemDto[]; total: number }) {
    this.items = params.items;
    this.total = params.total;
  }
}
