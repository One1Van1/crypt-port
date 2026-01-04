import { ApiProperty } from '@nestjs/swagger';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';

export class WithdrawCashResponseDto {
  @ApiProperty({ description: 'Withdrawal ID' })
  id: number;

  @ApiProperty({ description: 'Amount in pesos' })
  amountPesos: number;

  @ApiProperty({ description: 'Bank account ID' })
  bankAccountId: number;

  @ApiProperty({ description: 'Withdrawal rate (ARS per USDT)' })
  withdrawalRate: number;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Withdrawn by user ID' })
  withdrawnByUserId: number;

  @ApiProperty({ description: 'Comment' })
  comment: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(withdrawal: CashWithdrawal) {
    this.id = withdrawal.id;
    this.amountPesos = Number(withdrawal.amountPesos);
    this.bankAccountId = withdrawal.bankAccountId;
    this.withdrawalRate = Number(withdrawal.withdrawalRate);
    this.status = withdrawal.status;
    this.withdrawnByUserId = withdrawal.withdrawnByUserId;
    this.comment = withdrawal.comment;
    this.createdAt = withdrawal.createdAt;
  }
}
