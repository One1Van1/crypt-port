import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { NeoBankStatus } from '../common/enums/neo-bank.enum';
import { Drop } from './drop.entity';
import { Platform } from './platform.entity';

@Entity('drop_neo_banks')
export class DropNeoBank extends BaseEntity {
  @Column({ type: 'varchar' })
  provider: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ nullable: true, name: 'alias' })
  alias: string;

  @Column({
    type: 'enum',
    enum: NeoBankStatus,
    default: NeoBankStatus.ACTIVE,
  })
  status: NeoBankStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'current_balance' })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true, name: 'usdt_equivalent' })
  usdtEquivalent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'daily_limit' })
  dailyLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'monthly_limit' })
  monthlyLimit: number;

  @Column({ name: 'drop_id' })
  dropId: number;

  @ManyToOne(() => Drop)
  @JoinColumn({ name: 'drop_id' })
  drop: Drop;

  @Column({ name: 'platform_id', nullable: true })
  platformId: number;

  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;
}
