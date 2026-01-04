import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { NeoBankProvider, NeoBankStatus } from '../common/enums/neo-bank.enum';
import { Drop } from './drop.entity';
import { Platform } from './platform.entity';

@Entity('drop_neo_banks')
export class DropNeoBank extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NeoBankProvider,
  })
  provider: NeoBankProvider;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: NeoBankStatus,
    default: NeoBankStatus.ACTIVE,
  })
  status: NeoBankStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'current_balance' })
  currentBalance: number;

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
