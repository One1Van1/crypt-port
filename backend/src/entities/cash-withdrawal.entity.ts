import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { PesoToUsdtConversion } from './peso-to-usdt-conversion.entity';
import { CashWithdrawalStatus } from '../common/enums/cash-withdrawal-status.enum';

@Entity('cash_withdrawals')
export class CashWithdrawal extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'amount_pesos' })
  amountPesos: number;

  @Column({ name: 'bank_account_id' })
  bankAccountId: number; // ID физического банка откуда забрали

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'withdrawal_rate' })
  withdrawalRate: number; // Курс на момент забора денег

  @Column({
    type: 'varchar',
    length: 30,
    default: CashWithdrawalStatus.PENDING,
  })
  status: CashWithdrawalStatus;

  @Column({ name: 'withdrawn_by_user_id' })
  withdrawnByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'withdrawn_by_user_id' })
  withdrawnByUser: User;

  @OneToOne(() => PesoToUsdtConversion, conversion => conversion.cashWithdrawal, { nullable: true })
  conversion: PesoToUsdtConversion;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
