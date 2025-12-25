import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BalanceType, Currency } from '../common/enums/balance.enum';
import { Platform } from './platform.entity';

@Entity('balances')
export class Balance extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BalanceType,
  })
  type: BalanceType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true, name: 'amount_usdt' })
  amountUSDT: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, name: 'platform_id' })
  platformId: number;

  @ManyToOne(() => Platform, { nullable: true })
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;
}
