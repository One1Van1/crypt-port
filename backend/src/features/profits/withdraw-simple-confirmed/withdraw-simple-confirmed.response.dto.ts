import { ApiProperty } from '@nestjs/swagger';

export class WithdrawSimpleConfirmedProfitResponseDto {
  @ApiProperty({ description: 'Profit withdrawal ID' })
  id: number;

  @ApiProperty({ description: 'USDT amount withdrawn as profit' })
  withdrawnUsdt: number;

  @ApiProperty({ description: 'Admin withdrawal rate used' })
  adminRate: number;

  @ApiProperty({ description: 'Profit in pesos (ARS) received by admin' })
  profitPesos: number;

  @ApiProperty({ description: 'Created by user ID' })
  createdByUserId: number;

  @ApiProperty({ description: 'Creation timestamp' })
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
    this.withdrawnUsdt = Number(withdrawnUsdt);
    this.adminRate = Number(adminRate);
    this.profitPesos = Number(profitPesos);
    this.createdByUserId = createdByUserId;
    this.createdAt = createdAt;
  }
}
