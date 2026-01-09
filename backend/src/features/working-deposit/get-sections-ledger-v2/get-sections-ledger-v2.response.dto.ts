import { ApiProperty } from '@nestjs/swagger';

export class PlatformBalanceV2Dto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  rate: number;

  constructor(id: number, name: string, balance: number, rate: number) {
    this.id = id;
    this.name = name;
    this.balance = balance;
    this.rate = rate;
  }
}

export class AccountV2Dto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  type: 'neo_bank' | 'bank_account';

  @ApiProperty()
  identifier: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  platformId: number;

  @ApiProperty()
  platformName: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  balanceUsdt: number;

  constructor(params: {
    id: number;
    type: 'neo_bank' | 'bank_account';
    identifier: string;
    balance: number;
    platformId: number;
    platformName: string;
    rate: number;
    balanceUsdt: number;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.identifier = params.identifier;
    this.balance = params.balance;
    this.platformId = params.platformId;
    this.platformName = params.platformName;
    this.rate = params.rate;
    this.balanceUsdt = params.balanceUsdt;
  }
}

export class ConversionV2Dto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pesosAmount: number;

  @ApiProperty()
  usdtAmount: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: number,
    pesosAmount: number,
    usdtAmount: number,
    exchangeRate: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.pesosAmount = pesosAmount;
    this.usdtAmount = usdtAmount;
    this.exchangeRate = exchangeRate;
    this.createdAt = createdAt;
  }
}

export class WithdrawalV2Dto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  amountPesos: number;

  @ApiProperty()
  withdrawalRate: number;

  @ApiProperty()
  amountUsdt: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  constructor(params: {
    id: number;
    amountPesos: number;
    withdrawalRate: number;
    amountUsdt: number;
    status: string;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.amountPesos = params.amountPesos;
    this.withdrawalRate = params.withdrawalRate;
    this.amountUsdt = params.amountUsdt;
    this.status = params.status;
    this.createdAt = params.createdAt;
  }
}

export class PlatformBalancesV2Section {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: [PlatformBalanceV2Dto] })
  platforms: PlatformBalanceV2Dto[];

  constructor(total: number, platforms: PlatformBalanceV2Dto[]) {
    this.total = total;
    this.platforms = platforms;
  }
}

export class PesosAccountsV2Section {
  @ApiProperty()
  totalPesos: number;

  @ApiProperty()
  totalUsdt: number;

  @ApiProperty({ type: [AccountV2Dto] })
  accounts: AccountV2Dto[];

  constructor(totalPesos: number, totalUsdt: number, accounts: AccountV2Dto[]) {
    this.totalPesos = totalPesos;
    this.totalUsdt = totalUsdt;
    this.accounts = accounts;
  }
}

export class FreeUsdtV2Section {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalConverted: number;

  @ApiProperty()
  totalWithdrawn: number;

  @ApiProperty({ type: [ConversionV2Dto] })
  conversions: ConversionV2Dto[];

  constructor(total: number, totalConverted: number, totalWithdrawn: number, conversions: ConversionV2Dto[]) {
    this.total = total;
    this.totalConverted = totalConverted;
    this.totalWithdrawn = totalWithdrawn;
    this.conversions = conversions;
  }
}

export class ProfitReserveV2Section {
  @ApiProperty()
  totalUsdt: number;

  constructor(totalUsdt: number) {
    this.totalUsdt = totalUsdt;
  }
}

export class DeficitV2Section {
  @ApiProperty()
  totalPesos: number;

  @ApiProperty()
  totalUsdt: number;

  @ApiProperty({ type: [WithdrawalV2Dto] })
  withdrawals: WithdrawalV2Dto[];

  constructor(totalPesos: number, totalUsdt: number, withdrawals: WithdrawalV2Dto[]) {
    this.totalPesos = totalPesos;
    this.totalUsdt = totalUsdt;
    this.withdrawals = withdrawals;
  }
}

export class SummaryV2Section {
  @ApiProperty()
  totalUsdt: number;

  @ApiProperty()
  initialDeposit: number;

  @ApiProperty()
  profit: number;

  constructor(totalUsdt: number, initialDeposit: number, profit: number) {
    this.totalUsdt = totalUsdt;
    this.initialDeposit = initialDeposit;
    this.profit = profit;
  }
}

export class GetWorkingDepositSectionsLedgerV2ResponseDto {
  @ApiProperty({ type: PlatformBalancesV2Section })
  platformBalances: PlatformBalancesV2Section;

  @ApiProperty({ type: PesosAccountsV2Section })
  blockedPesos: PesosAccountsV2Section;

  @ApiProperty({ type: PesosAccountsV2Section })
  unpaidPesos: PesosAccountsV2Section;

  @ApiProperty({ type: FreeUsdtV2Section })
  freeUsdt: FreeUsdtV2Section;

  @ApiProperty({ type: ProfitReserveV2Section })
  profitReserve: ProfitReserveV2Section;

  @ApiProperty({ type: DeficitV2Section })
  deficit: DeficitV2Section;

  @ApiProperty({ type: SummaryV2Section })
  summary: SummaryV2Section;

  constructor(params: {
    platformBalances: PlatformBalancesV2Section;
    blockedPesos: PesosAccountsV2Section;
    unpaidPesos: PesosAccountsV2Section;
    freeUsdt: FreeUsdtV2Section;
    profitReserve: ProfitReserveV2Section;
    deficit: DeficitV2Section;
    summary: SummaryV2Section;
  }) {
    this.platformBalances = params.platformBalances;
    this.blockedPesos = params.blockedPesos;
    this.unpaidPesos = params.unpaidPesos;
    this.freeUsdt = params.freeUsdt;
    this.profitReserve = params.profitReserve;
    this.deficit = params.deficit;
    this.summary = params.summary;
  }
}
