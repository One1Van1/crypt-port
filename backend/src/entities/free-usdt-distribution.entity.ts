import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Platform } from './platform.entity';
import { User } from './user.entity';

@Entity('free_usdt_distributions')
export class FreeUsdtDistribution extends BaseEntity {
  @Column({ name: 'platform_id' })
  platformId: number;

  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'amount_usdt' })
  amountUsdt: number;

  @Column({ name: 'distributed_by_user_id' })
  distributedByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'distributed_by_user_id' })
  distributedByUser: User;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
