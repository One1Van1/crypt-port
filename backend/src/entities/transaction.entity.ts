import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { TransactionStatus } from '../common/enums/transaction.enum';
import { BankAccount } from './bank-account.entity';
import { Shift } from './shift.entity';
import { User } from './user.entity';
import { DropNeoBank } from './drop-neo-bank.entity';
import { Platform } from './platform.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

@Column({ type: 'decimal', precision: 15, scale: 4, nullable: true, name: 'amount_usdt' })
  amountUSDT: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  receipt: string;

  @Column({ nullable: true, name: 'source_drop_neo_bank_id' })
  sourceDropNeoBankId: number;

  @ManyToOne(() => DropNeoBank, { nullable: true })
  @JoinColumn({ name: 'source_drop_neo_bank_id' })
  sourceDropNeoBank: DropNeoBank;

  @Column({ name: 'bank_account_id' })
  bankAccountId: number;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.transactions)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({ name: 'shift_id' })
  shiftId: number;

  @ManyToOne(() => Shift, (shift) => shift.transactions)
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Column({ name: 'platform_id', nullable: true })
  platformId: number;

  @ManyToOne(() => Platform, { nullable: true })
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
