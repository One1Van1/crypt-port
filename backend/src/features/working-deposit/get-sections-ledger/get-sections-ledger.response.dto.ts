import { ApiProperty } from '@nestjs/swagger';

export class PlatformBalanceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  exchangeRate: number;

  constructor(id: number, name: string, balance: number, exchangeRate: number) {
    this.id = id;
    this.name = name;
    this.balance = balance;
    this.exchangeRate = exchangeRate;
  }
}

export class AccountDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  type: 'neo_bank' | 'bank_account';

  @ApiProperty()
  name: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  platformId: number;

  @ApiProperty()
  platformName: string;

  @ApiProperty()
  exchangeRate: number;

  constructor(
    id: number,
    type: 'neo_bank' | 'bank_account',
    name: string,
    amount: number,
    platformId: number,
    platformName: string,
    exchangeRate: number,
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.amount = amount;
    this.platformId = platformId;
    this.platformName = platformName;
    this.exchangeRate = exchangeRate;
  }
}

export class ConversionDto {
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

export class WithdrawalDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  constructor(id: number, amount: number, exchangeRate: number, status: string, createdAt: Date) {
    this.id = id;
    this.amount = amount;
    this.exchangeRate = exchangeRate;
    this.status = status;
    this.createdAt = createdAt;
  }
}

export class PlatformBalancesSection {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: [PlatformBalanceDto] })
  platforms: PlatformBalanceDto[];

  constructor(total: number, platforms: PlatformBalanceDto[]) {
    this.total = total;
    this.platforms = platforms;
  }
}

export class BlockedPesosSection {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalUsdt: number;

  @ApiProperty({ type: [AccountDto] })
  accounts: AccountDto[];

  constructor(total: number, totalUsdt: number, accounts: AccountDto[]) {
    this.total = total;
    this.totalUsdt = totalUsdt;
    this.accounts = accounts;
  }
}

export class UnpaidPesosSection {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalUsdt: number;

  @ApiProperty({ type: [AccountDto] })
  accounts: AccountDto[];

  constructor(total: number, totalUsdt: number, accounts: AccountDto[]) {
    this.total = total;
    this.totalUsdt = totalUsdt;
    this.accounts = accounts;
  }
}

export class FreeUsdtSection {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalConverted: number;

  @ApiProperty()
  totalWithdrawn: number;

  @ApiProperty({ type: [ConversionDto] })
  conversions: ConversionDto[];

  constructor(total: number, totalConverted: number, totalWithdrawn: number, conversions: ConversionDto[]) {
    this.total = total;
    this.totalConverted = totalConverted;
    this.totalWithdrawn = totalWithdrawn;
    this.conversions = conversions;
  }
}

export class ProfitReserveSection {
  @ApiProperty()
  totalUsdt: number;

  constructor(totalUsdt: number) {
    this.totalUsdt = totalUsdt;
  }
}

export class DeficitSection {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalUsdt: number;

  @ApiProperty({ type: [WithdrawalDto] })
  withdrawals: WithdrawalDto[];

  constructor(total: number, totalUsdt: number, withdrawals: WithdrawalDto[]) {
    this.total = total;
    this.totalUsdt = totalUsdt;
    this.withdrawals = withdrawals;
  }
}

export class SummarySection {
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

export class GetWorkingDepositSectionsLedgerResponseDto {
  @ApiProperty({ type: PlatformBalancesSection })
  platformBalances: PlatformBalancesSection;

  @ApiProperty({ type: BlockedPesosSection })
  blockedPesos: BlockedPesosSection;

  @ApiProperty({ type: UnpaidPesosSection })
  unpaidPesos: UnpaidPesosSection;

  @ApiProperty({ type: FreeUsdtSection })
  freeUsdt: FreeUsdtSection;

  @ApiProperty({ type: ProfitReserveSection })
  profitReserve: ProfitReserveSection;

  @ApiProperty({ type: DeficitSection })
  deficit: DeficitSection;

  @ApiProperty({ type: SummarySection })
  summary: SummarySection;

  constructor(
    platformBalances: PlatformBalancesSection,
    blockedPesos: BlockedPesosSection,
    unpaidPesos: UnpaidPesosSection,
    freeUsdt: FreeUsdtSection,
    profitReserve: ProfitReserveSection,
    deficit: DeficitSection,
    summary: SummarySection,
  ) {
    this.platformBalances = platformBalances;
    this.blockedPesos = blockedPesos;
    this.unpaidPesos = unpaidPesos;
    this.freeUsdt = freeUsdt;
    this.profitReserve = profitReserve;
    this.deficit = deficit;
    this.summary = summary;
  }
}
