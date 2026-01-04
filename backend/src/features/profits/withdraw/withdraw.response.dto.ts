import { ApiProperty } from '@nestjs/swagger';

export class WithdrawProfitResponseDto {
  @ApiProperty({ description: 'Profit withdrawal ID' })
  id: number;

  @ApiProperty({ description: 'USDT amount withdrawn as profit' })
  withdrawnUsdt: number;

  @ApiProperty({ description: 'Admin withdrawal rate used' })
  adminRate: number;

  @ApiProperty({ description: 'Current global rate' })
  globalRate: number;

  @ApiProperty({ description: 'Profit in pesos' })
  profitPesos: number;

  @ApiProperty({ description: 'Total pesos received by admin' })
  totalPesosReceived: number;

  @ApiProperty({ description: 'Principal amount returned to system (pesos)' })
  returnedAmountPesos: number;

  @ApiProperty({ description: 'Section where principal was returned' })
  returnedToSection: string;

  @ApiProperty({ description: 'Created by user ID' })
  createdByUserId: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  constructor(
    id: number,
    withdrawnUsdt: number,
    adminRate: number,
    globalRate: number,
    profitPesos: number,
    totalPesosReceived: number,
    returnedAmountPesos: number,
    returnedToSection: string,
    createdByUserId: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.withdrawnUsdt = Number(withdrawnUsdt);
    this.adminRate = Number(adminRate);
    this.globalRate = Number(globalRate);
    this.profitPesos = Number(profitPesos);
    this.totalPesosReceived = Number(totalPesosReceived);
    this.returnedAmountPesos = Number(returnedAmountPesos);
    this.returnedToSection = returnedToSection;
    this.createdByUserId = createdByUserId;
    this.createdAt = createdAt;
  }
}
