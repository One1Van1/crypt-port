import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';

@Entity('exchange_rates')
export class ExchangeRate extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  rate: number;

  @Column({ name: 'set_by_user_id' })
  setByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'set_by_user_id' })
  setByUser: User;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;
}
