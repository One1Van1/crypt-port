import { ApiProperty } from '@nestjs/swagger';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class GetRequisiteV3PlatformDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Binance' })
  name: string;

  @ApiProperty({ example: 1100 })
  exchangeRate: number;

  constructor(params: { id: number; name: string; exchangeRate: number }) {
    this.id = params.id;
    this.name = params.name;
    this.exchangeRate = params.exchangeRate;
  }
}

export class GetRequisiteV3ShiftDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: GetRequisiteV3PlatformDto })
  platform: GetRequisiteV3PlatformDto;

  constructor(params: { id: number; platform: GetRequisiteV3PlatformDto }) {
    this.id = params.id;
    this.platform = params.platform;
  }
}

export class GetRequisiteV3BankDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Santander' })
  name: string;

  constructor(params: { id: number; name: string }) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class GetRequisiteV3DropDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Drop 1' })
  name: string;

  constructor(params: { id: number; name: string }) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class GetRequisiteV3BankAccountDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '1234567890123456789012' })
  cbu: string;

  @ApiProperty({ example: 'ALIAS.BANK.ACCOUNT' })
  alias: string;

  @ApiProperty({ enum: BankAccountStatus, enumName: 'BankAccountStatus' })
  status: BankAccountStatus;

  @ApiProperty({ example: 100000 })
  initialLimitAmount: number;

  @ApiProperty({ example: 50000 })
  currentLimitAmount: number;

  @ApiProperty({ example: 25000 })
  withdrawnAmount: number;

  @ApiProperty({ type: GetRequisiteV3BankDto })
  bank: GetRequisiteV3BankDto;

  @ApiProperty({ type: GetRequisiteV3DropDto })
  drop: GetRequisiteV3DropDto;

  constructor(params: {
    id: number;
    cbu: string;
    alias: string;
    status: BankAccountStatus;
    initialLimitAmount: number;
    currentLimitAmount: number;
    withdrawnAmount: number;
    bank: GetRequisiteV3BankDto;
    drop: GetRequisiteV3DropDto;
  }) {
    this.id = params.id;
    this.cbu = params.cbu;
    this.alias = params.alias;
    this.status = params.status;
    this.initialLimitAmount = params.initialLimitAmount;
    this.currentLimitAmount = params.currentLimitAmount;
    this.withdrawnAmount = params.withdrawnAmount;
    this.bank = params.bank;
    this.drop = params.drop;
  }
}

export class GetRequisiteV3NeoBankDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'MercadoPago' })
  provider: string;

  @ApiProperty({ example: 'account-123' })
  accountId: string;

  @ApiProperty({ example: 'ALIAS.NEO.BANK', required: false, nullable: true })
  alias: string;

  @ApiProperty({ example: 100000, required: false, nullable: true })
  dailyLimit: number;

  @ApiProperty({ example: 1000000, required: false, nullable: true })
  monthlyLimit: number;

  @ApiProperty({ example: 1 })
  dropId: number;

  constructor(params: {
    id: number;
    provider: string;
    accountId: string;
    alias: string;
    dailyLimit: number;
    monthlyLimit: number;
    dropId: number;
  }) {
    this.id = params.id;
    this.provider = params.provider;
    this.accountId = params.accountId;
    this.alias = params.alias;
    this.dailyLimit = params.dailyLimit;
    this.monthlyLimit = params.monthlyLimit;
    this.dropId = params.dropId;
  }
}

export class GetRequisiteV3ResponseDto {
  @ApiProperty({ type: GetRequisiteV3ShiftDto })
  shift: GetRequisiteV3ShiftDto;

  @ApiProperty({ type: GetRequisiteV3BankAccountDto })
  bankAccount: GetRequisiteV3BankAccountDto;

  @ApiProperty({ type: GetRequisiteV3NeoBankDto, isArray: true })
  neoBanks: GetRequisiteV3NeoBankDto[];

  constructor(params: {
    shift: GetRequisiteV3ShiftDto;
    bankAccount: GetRequisiteV3BankAccountDto;
    neoBanks: GetRequisiteV3NeoBankDto[];
  }) {
    this.shift = params.shift;
    this.bankAccount = params.bankAccount;
    this.neoBanks = params.neoBanks;
  }
}
