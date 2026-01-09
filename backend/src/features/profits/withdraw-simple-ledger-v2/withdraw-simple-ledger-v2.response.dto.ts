import { ApiProperty } from '@nestjs/swagger';

export class WithdrawSimpleLedgerV2ProfitResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 94.44 })
  withdrawnUsdt: number;

  @ApiProperty({ example: 1000 })
  adminRate: number;

  @ApiProperty({ example: 94440 })
  profitPesos: number;

  @ApiProperty()
  createdByUserId: number;

  @ApiProperty()
  createdAt: Date;

  constructor(params: {
    id: number;
    withdrawnUsdt: number;
    adminRate: number;
    profitPesos: number;
    createdByUserId: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.withdrawnUsdt = params.withdrawnUsdt;
    this.adminRate = params.adminRate;
    this.profitPesos = params.profitPesos;
    this.createdByUserId = params.createdByUserId;
    this.createdAt = params.createdAt;
  }
}
