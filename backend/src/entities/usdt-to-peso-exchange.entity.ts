import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Platform } from './platform.entity';
import { DropNeoBank } from './drop-neo-bank.entity';
import { User } from './user.entity';

@Entity('usdt_to_peso_exchanges')
export class UsdtToPesoExchange extends BaseEntity {
  @Column({ name: 'platform_id' })
  platformId: number;

  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @Column({ name: 'neo_bank_id' })
  neoBankId: number;

  @ManyToOne(() => DropNeoBank)
  @JoinColumn({ name: 'neo_bank_id' })
  neoBank: DropNeoBank;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'usdt_amount' })
  usdtAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'pesos_amount' })
  pesosAmount: number;

  @Column({ name: 'created_by_user_id' })
  createdByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;
}
