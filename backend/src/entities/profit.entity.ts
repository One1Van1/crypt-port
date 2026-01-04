import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';

@Entity('profits')
export class Profit extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'withdrawn_usdt' })
  withdrawnUsdt: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'admin_rate' })
  adminRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'profit_pesos' })
  profitPesos: number;

  @Column({ name: 'returned_to_section' })
  returnedToSection: 'blocked_pesos' | 'unpaid_pesos';

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'returned_amount_pesos' })
  returnedAmountPesos: number;

  @Column({ name: 'created_by_user_id' })
  createdByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;
}
