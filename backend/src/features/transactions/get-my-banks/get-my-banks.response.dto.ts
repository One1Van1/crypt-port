import { ApiProperty } from '@nestjs/swagger';

export class BankItemDto {
  @ApiProperty({ description: 'Bank ID' })
  id: string;

  @ApiProperty({ description: 'Bank name' })
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class GetMyBanksResponseDto {
  @ApiProperty({ description: 'List of banks', type: [BankItemDto] })
  items: BankItemDto[];

  constructor(items: BankItemDto[]) {
    this.items = items;
  }
}
