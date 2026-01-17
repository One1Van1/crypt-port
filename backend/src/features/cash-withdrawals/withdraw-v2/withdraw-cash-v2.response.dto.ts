import { ApiProperty } from '@nestjs/swagger';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';

export class WithdrawCashV2ResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 100000 })
  amountPesos: number;

  @ApiProperty({ example: 1 })
  bankAccountId: number;

  @ApiProperty({ example: 1000 })
  withdrawalRate: number;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 123 })
  withdrawnByUserId: number;

  @ApiProperty({ required: false, example: 'Optional comment' })
  comment?: string;

  @ApiProperty({ example: '2026-01-16T00:00:00.000Z' })
  createdAt: Date;

  constructor(withdrawal: CashWithdrawal) {
    this.id = withdrawal.id;
    this.amountPesos = Number(withdrawal.amountPesos);
    this.bankAccountId = Number(withdrawal.bankAccountId);
    this.withdrawalRate = Number(withdrawal.withdrawalRate);
    this.status = String(withdrawal.status);
    this.withdrawnByUserId = Number(withdrawal.withdrawnByUserId);
    this.comment = withdrawal.comment ?? undefined;
    this.createdAt = withdrawal.createdAt;
  }
}
