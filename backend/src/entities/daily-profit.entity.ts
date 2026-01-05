import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('daily_profits')
@Unique(['date'])
export class DailyProfit extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  @Column('decimal', { precision: 18, scale: 8 })
  totalUsdt: number;

  @Column('decimal', { precision: 18, scale: 8 })
  initialDeposit: number;

  @Column('decimal', { precision: 18, scale: 8 })
  profit: number;
}
