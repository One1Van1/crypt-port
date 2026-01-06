import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';

@Entity('deficit_records')
@Index(['date'], { unique: true })
export class DeficitRecord extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, name: 'amount_usdt' })
  amountUsdt: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, name: 'working_deposit_usdt' })
  workingDepositUsdt: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, name: 'initial_deposit_usdt' })
  initialDepositUsdt: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser?: User;

  @Column({ type: 'int', nullable: true, name: 'created_by_user_id' })
  created_by_user_id?: number;
}
