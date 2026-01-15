import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { Debt } from './debt.entity';
import { PesoToUsdtConversion } from './peso-to-usdt-conversion.entity';

export enum DebtOperationType {
  MANUAL_SET = 'MANUAL_SET',
  REPAYMENT_FROM_UNPAID_PESO_EXCHANGE = 'REPAYMENT_FROM_UNPAID_PESO_EXCHANGE',
}

@Entity('debt_operations')
@Index(['type'])
export class DebtOperation extends BaseEntity {
  @ManyToOne(() => Debt, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debt_id' })
  debt?: Debt;

  @Column({ type: 'int', name: 'debt_id' })
  debtId: number;

  @Column({ type: 'enum', enum: DebtOperationType })
  type: DebtOperationType;

  // Positive increases debt; negative decreases debt.
  @Column({ type: 'decimal', precision: 18, scale: 8, name: 'delta_usdt' })
  deltaUsdt: string;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @ManyToOne(() => PesoToUsdtConversion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_conversion_id' })
  sourceConversion?: PesoToUsdtConversion;

  @Column({ type: 'int', nullable: true, name: 'source_conversion_id' })
  source_conversion_id?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser?: User;

  @Column({ type: 'int', nullable: true, name: 'created_by_user_id' })
  created_by_user_id?: number;
}
