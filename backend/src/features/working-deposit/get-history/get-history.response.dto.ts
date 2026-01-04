import { ApiProperty } from '@nestjs/swagger';

export class WorkingDepositHistoryPointDto {
  @ApiProperty({ description: 'Date of the snapshot' })
  date: string;

  @ApiProperty({ description: 'Total USDT at this point' })
  totalUsdt: number;

  @ApiProperty({ description: 'Initial deposit at this point' })
  initialDeposit: number;

  @ApiProperty({ description: 'Profit/loss at this point' })
  profit: number;

  @ApiProperty({ description: 'Platform balances' })
  platformBalances: number;

  @ApiProperty({ description: 'Blocked pesos in USDT' })
  blockedPesos: number;

  @ApiProperty({ description: 'Unpaid pesos in USDT' })
  unpaidPesos: number;

  @ApiProperty({ description: 'Free USDT' })
  freeUsdt: number;

  @ApiProperty({ description: 'Deficit in USDT' })
  deficit: number;
}

export class GetWorkingDepositHistoryResponseDto {
  @ApiProperty({ type: [WorkingDepositHistoryPointDto] })
  history: WorkingDepositHistoryPointDto[];

  constructor(history: WorkingDepositHistoryPointDto[]) {
    this.history = history;
  }
}
