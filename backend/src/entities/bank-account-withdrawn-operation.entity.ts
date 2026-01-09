import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BankAccount } from './bank-account.entity';
import { Platform } from './platform.entity';
import { DropNeoBank } from './drop-neo-bank.entity';
import { Transaction } from './transaction.entity';
import { CashWithdrawal } from './cash-withdrawal.entity';
import { User } from './user.entity';

export enum BankAccountWithdrawnOperationType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Entity('bank_account_withdrawn_operations')
@Index(['bankAccountId', 'createdAt'])
export class BankAccountWithdrawnOperation extends BaseEntity {
  @Column({ name: 'bank_account_id' })
  bankAccountId: number;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({
    type: 'enum',
    enum: BankAccountWithdrawnOperationType,
  })
  type: BankAccountWithdrawnOperationType;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'amount_pesos' })
  amountPesos: string;

  // For CREDIT rows: remainingPesos is the not-yet-withdrawn ARS portion of this credit.
  // For DEBIT rows: remainingPesos is always 0.
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'remaining_pesos', default: 0 })
  remainingPesos: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'platform_rate', nullable: true })
  platformRate?: string;

  @Column({ name: 'platform_id', nullable: true })
  platformId?: number;

  @ManyToOne(() => Platform, { nullable: true })
  @JoinColumn({ name: 'platform_id' })
  platform?: Platform;

  @Column({ name: 'source_drop_neo_bank_id', nullable: true })
  sourceDropNeoBankId?: number;

  @ManyToOne(() => DropNeoBank, { nullable: true })
  @JoinColumn({ name: 'source_drop_neo_bank_id' })
  sourceDropNeoBank?: DropNeoBank;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: number;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Transaction;

  @Column({ name: 'cash_withdrawal_id', nullable: true })
  cashWithdrawalId?: number;

  @ManyToOne(() => CashWithdrawal, { nullable: true })
  @JoinColumn({ name: 'cash_withdrawal_id' })
  cashWithdrawal?: CashWithdrawal;

  @Column({ type: 'int', nullable: true, name: 'created_by_user_id' })
  createdByUserId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser?: User;
}
