import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { TransactionStatus } from '../common/enums/transaction.enum';
import { BankAccount } from './bank-account.entity';
import { Shift } from './shift.entity';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  amountUSDT: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.transactions)
  bankAccount: BankAccount;

  @ManyToOne(() => Shift, (shift) => shift.transactions)
  shift: Shift;

  @ManyToOne(() => User)
  operator: User;
}
