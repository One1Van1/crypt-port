import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BankAccountStatus } from '../common/enums/bank-account.enum';
import { Bank } from './bank.entity';
import { Drop } from './drop.entity';
import { Transaction } from './transaction.entity';

@Entity('bank_accounts')
export class BankAccount extends BaseEntity {
  @Column({ unique: true, length: 22 })
  cbu: string;

  @Column()
  alias: string;

  @Column({
    type: 'enum',
    enum: BankAccountStatus,
    default: BankAccountStatus.WORKING,
  })
  status: BankAccountStatus;

  @Column({ nullable: true, name: 'block_reason' })
  blockReason: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'initial_limit_amount' })
  initialLimitAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'current_limit_amount' })
  currentLimitAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'withdrawn_amount' })
  withdrawnAmount: number;

  @Column({ default: 1 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date;

  @Column({ name: 'bank_id' })
  bankId: number;

  @ManyToOne(() => Bank)
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;

  @Column({ name: 'drop_id' })
  dropId: number;

  @ManyToOne(() => Drop, (drop) => drop.bankAccounts)
  @JoinColumn({ name: 'drop_id' })
  drop: Drop;

  @OneToMany(() => Transaction, (transaction) => transaction.bankAccount)
  transactions: Transaction[];
}
