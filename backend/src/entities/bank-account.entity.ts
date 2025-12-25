import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
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

  @Column({ nullable: true })
  blockReason: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'limitAmount' })
  limitAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  withdrawnAmount: number;

  @Column({ default: 1 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @ManyToOne(() => Bank)
  bank: Bank;

  @ManyToOne(() => Drop, (drop) => drop.bankAccounts)
  drop: Drop;

  @OneToMany(() => Transaction, (transaction) => transaction.bankAccount)
  transactions: Transaction[];
}
