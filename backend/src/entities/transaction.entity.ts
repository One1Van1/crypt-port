import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { TransactionStatus } from '../common/enums/transaction.enum';
import { BankAccount } from './bank-account.entity';
import { Shift } from './shift.entity';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true, name: 'amount_usdt' })
  amountUSDT: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  comment: string;

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

  @Column({ name: 'operator_id' })
  operatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;
}
