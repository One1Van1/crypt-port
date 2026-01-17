import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum PesosAccountsDetailsKind {
  UNPAID = 'unpaid',
  BLOCKED = 'blocked',
}

export class GetPesosAccountsDetailsV1QueryDto {
  @ApiProperty({
    enum: PesosAccountsDetailsKind,
    enumName: 'PesosAccountsDetailsKind',
    example: PesosAccountsDetailsKind.UNPAID,
    description: 'Which pesos accounts list to return',
  })
  @IsEnum(PesosAccountsDetailsKind)
  kind: PesosAccountsDetailsKind;
}
