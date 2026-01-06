import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { PesoToUsdtConversion } from './peso-to-usdt-conversion.entity';
import { User } from './user.entity';

@Entity('free_usdt_entries')
export class FreeUsdtEntry extends BaseEntity {
  @Column({ name: 'conversion_id', unique: true })
  conversionId: number;

  @ManyToOne(() => PesoToUsdtConversion)
  @JoinColumn({ name: 'conversion_id' })
  conversion: PesoToUsdtConversion;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'pesos_amount' })
  pesosAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'usdt_amount' })
  usdtAmount: number;

  @Column({ name: 'converted_by_user_id' })
  convertedByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'converted_by_user_id' })
  convertedByUser: User;

  @Column({ name: 'confirmed_by_user_id' })
  confirmedByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'confirmed_by_user_id' })
  confirmedByUser: User;

  @Column({ type: 'timestamp', name: 'confirmed_at' })
  confirmedAt: Date;
}
