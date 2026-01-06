import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { ProfitReserve } from './profit-reserve.entity';

export enum FreeUsdtAdjustmentReason {
  RESERVE_PROFIT = 'RESERVE_PROFIT',
}

@Entity('free_usdt_adjustments')
@Index(['reason'])
export class FreeUsdtAdjustment extends BaseEntity {
  @Column({ type: 'enum', enum: FreeUsdtAdjustmentReason })
  reason: FreeUsdtAdjustmentReason;

  // Negative value decreases free-usdt
  @Column({ type: 'decimal', precision: 18, scale: 8, name: 'amount_usdt' })
  amountUsdt: string;

  @ManyToOne(() => ProfitReserve, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profit_reserve_id' })
  profitReserve?: ProfitReserve;

  @Column({ type: 'int', nullable: true, name: 'profit_reserve_id' })
  profit_reserve_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser?: User;

  @Column({ type: 'int', nullable: true, name: 'created_by_user_id' })
  created_by_user_id?: number;
}
