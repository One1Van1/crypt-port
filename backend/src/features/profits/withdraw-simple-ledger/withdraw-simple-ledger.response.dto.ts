import { ApiProperty } from '@nestjs/swagger';

export class WithdrawSimpleLedgerProfitResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 10 })
  withdrawnUsdt: number;

  @ApiProperty({ example: 1100 })
  adminRate: number;

  @ApiProperty({ example: 11000 })
  profitPesos: number;

  @ApiProperty({ example: 1 })
  createdByUserId: number;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: number,
    withdrawnUsdt: number,
    adminRate: number,
    profitPesos: number,
    createdByUserId: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.withdrawnUsdt = withdrawnUsdt;
    this.adminRate = adminRate;
    this.profitPesos = profitPesos;
    this.createdByUserId = createdByUserId;
    this.createdAt = createdAt;
  }
}
