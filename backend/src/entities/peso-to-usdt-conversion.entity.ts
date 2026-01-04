import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { CashWithdrawal } from './cash-withdrawal.entity';

@Entity('peso_to_usdt_conversions')
export class PesoToUsdtConversion extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'pesos_amount' })
  pesosAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'usdt_amount' })
  usdtAmount: number;

  @Column({ name: 'converted_by_user_id' })
  convertedByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'converted_by_user_id' })
  convertedByUser: User;

  @Column({ name: 'cash_withdrawal_id', nullable: true })
  cashWithdrawalId: number;

  @OneToOne(() => CashWithdrawal, withdrawal => withdrawal.conversion)
  @JoinColumn({ name: 'cash_withdrawal_id' })
  cashWithdrawal: CashWithdrawal;
}
