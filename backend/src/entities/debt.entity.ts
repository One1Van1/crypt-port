import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('debts')
@Index(['key'], { unique: true })
export class Debt extends BaseEntity {
  @Column({ type: 'varchar', length: 50, default: 'global' })
  key: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, name: 'amount_usdt', default: 0 })
  amountUsdt: string;
}
