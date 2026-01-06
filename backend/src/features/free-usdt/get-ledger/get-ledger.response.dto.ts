import { ApiProperty } from '@nestjs/swagger';

export class FreeUsdtLedgerItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pesosAmount: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  usdtAmount: number;

  @ApiProperty()
  convertedByUserId: number;

  @ApiProperty()
  convertedByUserName: string;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: number,
    pesosAmount: number,
    exchangeRate: number,
    usdtAmount: number,
    convertedByUserId: number,
    convertedByUserName: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.pesosAmount = Number(pesosAmount);
    this.exchangeRate = Number(exchangeRate);
    this.usdtAmount = Number(usdtAmount);
    this.convertedByUserId = convertedByUserId;
    this.convertedByUserName = convertedByUserName;
    this.createdAt = createdAt;
  }
}

export class FreeUsdtLedgerSummaryDto {
  @ApiProperty({ description: 'Total confirmed USDT converted' })
  totalConfirmedUsdt: number;

  @ApiProperty({ description: 'Total withdrawn profit USDT' })
  totalWithdrawnProfitUsdt: number;

  @ApiProperty({ description: 'Free USDT available (confirmed - withdrawn)' })
  freeUsdt: number;

  @ApiProperty({ description: 'Initial deposit (from settings)' })
  initialDeposit: number;

  @ApiProperty({ description: 'Profit available to withdraw (max(0, freeUsdt - initialDeposit))' })
  availableProfitUsdt: number;

  constructor(
    totalConfirmedUsdt: number,
    totalWithdrawnProfitUsdt: number,
    freeUsdt: number,
    initialDeposit: number,
    availableProfitUsdt: number,
  ) {
    this.totalConfirmedUsdt = Number(totalConfirmedUsdt);
    this.totalWithdrawnProfitUsdt = Number(totalWithdrawnProfitUsdt);
    this.freeUsdt = Number(freeUsdt);
    this.initialDeposit = Number(initialDeposit);
    this.availableProfitUsdt = Number(availableProfitUsdt);
  }
}

export class GetFreeUsdtLedgerResponseDto {
  @ApiProperty({ type: [FreeUsdtLedgerItemDto] })
  items: FreeUsdtLedgerItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ type: FreeUsdtLedgerSummaryDto })
  summary: FreeUsdtLedgerSummaryDto;

  constructor(items: FreeUsdtLedgerItemDto[], total: number, summary: FreeUsdtLedgerSummaryDto) {
    this.items = items;
    this.total = total;
    this.summary = summary;
  }
}
