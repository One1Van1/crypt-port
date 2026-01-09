import { ApiProperty } from '@nestjs/swagger';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class GetRequisiteV2PlatformDto {
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

export class GetRequisiteV2ShiftDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: GetRequisiteV2PlatformDto })
  platform: GetRequisiteV2PlatformDto;

  constructor(params: { id: number; platform: GetRequisiteV2PlatformDto }) {
    this.id = params.id;
    this.platform = params.platform;
  }
}

export class GetRequisiteV2BankDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Santander' })
  name: string;

  constructor(params: { id: number; name: string }) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class GetRequisiteV2DropDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Drop 1' })
  name: string;

  constructor(params: { id: number; name: string }) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class GetRequisiteV2BankAccountDto {
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

  @ApiProperty({ type: GetRequisiteV2BankDto })
  bank: GetRequisiteV2BankDto;

  @ApiProperty({ type: GetRequisiteV2DropDto })
  drop: GetRequisiteV2DropDto;

  constructor(params: {
    id: number;
    cbu: string;
    alias: string;
    status: BankAccountStatus;
    initialLimitAmount: number;
    currentLimitAmount: number;
    withdrawnAmount: number;
    bank: GetRequisiteV2BankDto;
    drop: GetRequisiteV2DropDto;
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

export class GetRequisiteV2NeoBankDto {
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

export class GetRequisiteV2ResponseDto {
  @ApiProperty({ type: GetRequisiteV2ShiftDto })
  shift: GetRequisiteV2ShiftDto;

  @ApiProperty({ type: GetRequisiteV2BankAccountDto })
  bankAccount: GetRequisiteV2BankAccountDto;

  @ApiProperty({ type: GetRequisiteV2NeoBankDto, isArray: true })
  neoBanks: GetRequisiteV2NeoBankDto[];

  constructor(params: {
    shift: GetRequisiteV2ShiftDto;
    bankAccount: GetRequisiteV2BankAccountDto;
    neoBanks: GetRequisiteV2NeoBankDto[];
  }) {
    this.shift = params.shift;
    this.bankAccount = params.bankAccount;
    this.neoBanks = params.neoBanks;
  }
}
