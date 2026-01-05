import { ApiProperty } from '@nestjs/swagger';

export class GetGeneralStatsResponseDto {
  @ApiProperty({ description: 'Total users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total operators' })
  totalOperators: number;

  @ApiProperty({ description: 'Total teamleads' })
  totalTeamleads: number;

  @ApiProperty({ description: 'Total banks' })
  totalBanks: number;

  @ApiProperty({ description: 'Total drops' })
  totalDrops: number;

  @ApiProperty({ description: 'Total bank accounts' })
  totalBankAccounts: number;

  @ApiProperty({ description: 'Working bank accounts' })
  workingBankAccounts: number;

  @ApiProperty({ description: 'Total platforms' })
  totalPlatforms: number;

  @ApiProperty({ description: 'Total shifts' })
  totalShifts: number;

  @ApiProperty({ description: 'Active shifts' })
  activeShifts: number;

  @ApiProperty({ description: 'Total transactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'Completed transactions' })
  completedTransactions: number;

  @ApiProperty({ description: 'Pending transactions' })
  pendingTransactions: number;

  @ApiProperty({ description: 'Total amount (all transactions)' })
  totalAmount: number;

  @ApiProperty({ description: 'Completed amount' })
  completedAmount: number;

  @ApiProperty({ description: 'Total balance across all platforms' })
  totalBalance: number;

  @ApiProperty({ description: 'Total withdrawn amount from bank accounts (ARS)' })
  totalWithdrawnFromBanks: number;

  constructor(data: {
    totalUsers: number;
    totalOperators: number;
    totalTeamleads: number;
    totalBanks: number;
    totalDrops: number;
    totalBankAccounts: number;
    workingBankAccounts: number;
    totalPlatforms: number;
    totalShifts: number;
    activeShifts: number;
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    totalAmount: number;
    completedAmount: number;
    totalBalance: number;
    totalWithdrawnFromBanks: number;
  }) {
    this.totalUsers = data.totalUsers;
    this.totalOperators = data.totalOperators;
    this.totalTeamleads = data.totalTeamleads;
    this.totalBanks = data.totalBanks;
    this.totalDrops = data.totalDrops;
    this.totalBankAccounts = data.totalBankAccounts;
    this.workingBankAccounts = data.workingBankAccounts;
    this.totalPlatforms = data.totalPlatforms;
    this.totalShifts = data.totalShifts;
    this.activeShifts = data.activeShifts;
    this.totalTransactions = data.totalTransactions;
    this.completedTransactions = data.completedTransactions;
    this.pendingTransactions = data.pendingTransactions;
    this.totalAmount = Math.round(data.totalAmount * 100) / 100;
    this.completedAmount = Math.round(data.completedAmount * 100) / 100;
    this.totalBalance = Math.round(data.totalBalance * 100) / 100;
    this.totalWithdrawnFromBanks = Math.round(data.totalWithdrawnFromBanks * 100) / 100;
  }
}
