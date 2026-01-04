import { ApiProperty } from '@nestjs/swagger';

export class ProfitHistoryItemDto {
  @ApiProperty({ description: 'Profit withdrawal ID' })
  id: number;

  @ApiProperty({ description: 'USDT amount withdrawn as profit' })
  withdrawnUsdt: number;

  @ApiProperty({ description: 'Admin withdrawal rate used' })
  adminRate: number;

  @ApiProperty({ description: 'Profit in pesos' })
  profitPesos: number;

  @ApiProperty({ description: 'Section where principal was returned' })
  returnedToSection: string;

  @ApiProperty({ description: 'Principal amount returned (pesos)' })
  returnedAmountPesos: number;

  @ApiProperty({ description: 'Created by user ID' })
  createdByUserId: number;

  @ApiProperty({ description: 'Created by user name' })
  createdByUserName: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  constructor(
    id: number,
    withdrawnUsdt: number,
    adminRate: number,
    profitPesos: number,
    returnedToSection: string,
    returnedAmountPesos: number,
    createdByUserId: number,
    createdByUserName: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.withdrawnUsdt = Number(withdrawnUsdt);
    this.adminRate = Number(adminRate);
    this.profitPesos = Number(profitPesos);
    this.returnedToSection = returnedToSection;
    this.returnedAmountPesos = Number(returnedAmountPesos);
    this.createdByUserId = createdByUserId;
    this.createdByUserName = createdByUserName;
    this.createdAt = createdAt;
  }
}

export class GetProfitHistoryResponseDto {
  @ApiProperty({ type: [ProfitHistoryItemDto] })
  items: ProfitHistoryItemDto[];

  @ApiProperty({ description: 'Total number of profit withdrawals' })
  total: number;

  constructor(items: ProfitHistoryItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
