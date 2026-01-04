import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { DropNeoBank } from './drop-neo-bank.entity';
import { BankAccount } from './bank-account.entity';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('neo_bank_withdrawals')
export class NeoBankWithdrawal extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'neo_bank_id' })
  neoBankId: number;

  @ManyToOne(() => DropNeoBank)
  @JoinColumn({ name: 'neo_bank_id' })
  neoBank: DropNeoBank;

  @Column({ name: 'bank_account_id' })
  bankAccountId: number;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ name: 'withdrawn_by_user_id' })
  withdrawnByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'withdrawn_by_user_id' })
  withdrawnByUser: User;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'balance_before' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'balance_after' })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
