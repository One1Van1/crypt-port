import { ApiProperty } from '@nestjs/swagger';

class PlatformBalanceDto {
  @ApiProperty({ description: 'Platform ID' })
  id: number;

  @ApiProperty({ description: 'Platform name' })
  name: string;

  @ApiProperty({ description: 'Balance in USDT' })
  balance: number;

  @ApiProperty({ description: 'Exchange rate (ARS per 1 USDT)' })
  rate: number;

  constructor(id: number, name: string, balance: number, rate: number) {
    this.id = id;
    this.name = name;
    this.balance = Number(balance);
    this.rate = Number(rate);
  }
}

class AccountDto {
  @ApiProperty({ description: 'Account ID' })
  id: number;

  @ApiProperty({ description: 'Account type (bank_account or neo_bank)' })
  type: string;

  @ApiProperty({ description: 'Account identifier (CBU/Alias or Provider)' })
  identifier: string;

  @ApiProperty({ description: 'Balance in pesos' })
  balance: number;

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Platform rate' })
  rate: number;

  @ApiProperty({ description: 'Balance in USDT equivalent' })
  balanceUsdt: number;

  constructor(
    id: number,
    type: string,
    identifier: string,
    balance: number,
    platformId: number,
    platformName: string,
    rate: number,
  ) {
    this.id = id;
    this.type = type;
    this.identifier = identifier;
    this.balance = Number(balance);
    this.platformId = platformId;
    this.platformName = platformName;
    this.rate = Number(rate);
    this.balanceUsdt = Number(balance) / Number(rate);
  }
}

class ConversionDto {
  @ApiProperty({ description: 'Conversion ID' })
  id: number;

  @ApiProperty({ description: 'Pesos amount' })
  pesosAmount: number;

  @ApiProperty({ description: 'USDT amount' })
  usdtAmount: number;

  @ApiProperty({ description: 'Exchange rate used' })
  exchangeRate: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(id: number, pesosAmount: number, usdtAmount: number, exchangeRate: number, createdAt: Date) {
    this.id = id;
    this.pesosAmount = Number(pesosAmount);
    this.usdtAmount = Number(usdtAmount);
    this.exchangeRate = Number(exchangeRate);
    this.createdAt = createdAt;
  }
}

class WithdrawalDto {
  @ApiProperty({ description: 'Withdrawal ID' })
  id: number;

  @ApiProperty({ description: 'Amount in pesos' })
  amountPesos: number;

  @ApiProperty({ description: 'Withdrawal rate' })
  withdrawalRate: number;

  @ApiProperty({ description: 'Amount in USDT equivalent' })
  amountUsdt: number;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(id: number, amountPesos: number, withdrawalRate: number, status: string, createdAt: Date) {
    this.id = id;
    this.amountPesos = Number(amountPesos);
    this.withdrawalRate = Number(withdrawalRate);
    this.amountUsdt = Number(amountPesos) / Number(withdrawalRate);
    this.status = status;
    this.createdAt = createdAt;
  }
}

class PlatformBalancesSection {
  @ApiProperty({ description: 'Total USDT across all platforms' })
  total: number;

  @ApiProperty({ description: 'Platform balances', type: [PlatformBalanceDto] })
  platforms: PlatformBalanceDto[];

  constructor(total: number, platforms: PlatformBalanceDto[]) {
    this.total = Number(total);
    this.platforms = platforms;
  }
}

class BlockedPesosSection {
  @ApiProperty({ description: 'Total in pesos' })
  total: number;

  @ApiProperty({ description: 'Total in USDT equivalent' })
  totalUsdt: number;

  @ApiProperty({ description: 'Blocked accounts', type: [AccountDto] })
  accounts: AccountDto[];

  constructor(total: number, totalUsdt: number, accounts: AccountDto[]) {
    this.total = Number(total);
    this.totalUsdt = Number(totalUsdt);
    this.accounts = accounts;
  }
}

class UnpaidPesosSection {
  @ApiProperty({ description: 'Total in pesos' })
  total: number;

  @ApiProperty({ description: 'Total in USDT equivalent' })
  totalUsdt: number;

  @ApiProperty({ description: 'Active accounts', type: [AccountDto] })
  accounts: AccountDto[];

  constructor(total: number, totalUsdt: number, accounts: AccountDto[]) {
    this.total = Number(total);
    this.totalUsdt = Number(totalUsdt);
    this.accounts = accounts;
  }
}

class FreeUsdtSection {
  @ApiProperty({ description: 'Total free USDT' })
  total: number;

  @ApiProperty({ description: 'Total converted USDT' })
  totalConverted: number;

  @ApiProperty({ description: 'Total withdrawn as profit' })
  totalWithdrawn: number;

  @ApiProperty({ description: 'Recent conversions', type: [ConversionDto] })
  recentConversions: ConversionDto[];

  constructor(total: number, totalConverted: number, totalWithdrawn: number, recentConversions: ConversionDto[]) {
    this.total = Number(total);
    this.totalConverted = Number(totalConverted);
    this.totalWithdrawn = Number(totalWithdrawn);
    this.recentConversions = recentConversions;
  }
}

class DeficitSection {
  @ApiProperty({ description: 'Total deficit in pesos (pending withdrawals)' })
  total: number;

  @ApiProperty({ description: 'Total deficit in USDT equivalent' })
  totalUsdt: number;

  @ApiProperty({ description: 'Pending cash withdrawals', type: [WithdrawalDto] })
  withdrawals: WithdrawalDto[];

  constructor(total: number, totalUsdt: number, withdrawals: WithdrawalDto[]) {
    this.total = Number(total);
    this.totalUsdt = Number(totalUsdt);
    this.withdrawals = withdrawals;
  }
}

class SummarySection {
  @ApiProperty({ description: 'Total USDT in working deposit' })
  totalUsdt: number;

  @ApiProperty({ description: 'Initial deposit (from settings)' })
  initialDeposit: number;

  @ApiProperty({ description: 'Current profit' })
  profit: number;

  constructor(totalUsdt: number, initialDeposit: number, profit: number) {
    this.totalUsdt = Number(totalUsdt);
    this.initialDeposit = Number(initialDeposit);
    this.profit = Number(profit);
  }
}

export class GetWorkingDepositSectionsResponseDto {
  @ApiProperty({ description: 'Platform balances section', type: PlatformBalancesSection })
  platformBalances: PlatformBalancesSection;

  @ApiProperty({ description: 'Blocked pesos section', type: BlockedPesosSection })
  blockedPesos: BlockedPesosSection;

  @ApiProperty({ description: 'Unpaid pesos section', type: UnpaidPesosSection })
  unpaidPesos: UnpaidPesosSection;

  @ApiProperty({ description: 'Free USDT section', type: FreeUsdtSection })
  freeUsdt: FreeUsdtSection;

  @ApiProperty({ description: 'Deficit section', type: DeficitSection })
  deficit: DeficitSection;

  @ApiProperty({ description: 'Summary', type: SummarySection })
  summary: SummarySection;

  constructor(
    platformBalances: PlatformBalancesSection,
    blockedPesos: BlockedPesosSection,
    unpaidPesos: UnpaidPesosSection,
    freeUsdt: FreeUsdtSection,
    deficit: DeficitSection,
    summary: SummarySection,
  ) {
    this.platformBalances = platformBalances;
    this.blockedPesos = blockedPesos;
    this.unpaidPesos = unpaidPesos;
    this.freeUsdt = freeUsdt;
    this.deficit = deficit;
    this.summary = summary;
  }
}

export { PlatformBalanceDto, AccountDto, ConversionDto, WithdrawalDto, PlatformBalancesSection, BlockedPesosSection, UnpaidPesosSection, FreeUsdtSection, DeficitSection, SummarySection };
