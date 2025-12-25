import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ShiftStatus } from '../common/enums/shift.enum';
import { User } from './user.entity';
import { Platform } from './platform.entity';
import { Transaction } from './transaction.entity';

@Entity('shifts')
export class Shift extends BaseEntity {
  @Column({ type: 'timestamp', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_time' })
  endTime: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ default: 0, name: 'operations_count' })
  operationsCount: number;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.ACTIVE,
  })
  status: ShiftStatus;

  @Column({ name: 'operator_id' })
  operatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ name: 'platform_id' })
  platformId: number;

  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @OneToMany(() => Transaction, (transaction) => transaction.shift)
  transactions: Transaction[];
}
