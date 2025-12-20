import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ShiftStatus } from '../common/enums/shift.enum';
import { User } from './user.entity';
import { Platform } from './platform.entity';
import { Transaction } from './transaction.entity';

@Entity('shifts')
export class Shift extends BaseEntity {
  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 0 })
  operationsCount: number;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.ACTIVE,
  })
  status: ShiftStatus;

  @ManyToOne(() => User)
  operator: User;

  @ManyToOne(() => Platform)
  platform: Platform;

  @OneToMany(() => Transaction, (transaction) => transaction.shift)
  transactions: Transaction[];
}
