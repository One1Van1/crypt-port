import { ApiProperty } from '@nestjs/swagger';

export class DailyProfitDto {
  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: 'Total USDT on that day' })
  totalUsdt: number;

  @ApiProperty({ description: 'Initial deposit' })
  initialDeposit: number;

  @ApiProperty({ description: 'Profit (can be negative)' })
  profit: number;

  constructor(date: string, totalUsdt: number, initialDeposit: number, profit: number) {
    this.date = date;
    this.totalUsdt = Number(totalUsdt);
    this.initialDeposit = Number(initialDeposit);
    this.profit = Number(profit);
  }
}

export class GetProfitHistoryResponseDto {
  @ApiProperty({ description: 'List of daily profits', type: [DailyProfitDto] })
  history: DailyProfitDto[];

  constructor(history: DailyProfitDto[]) {
    this.history = history;
  }
}
