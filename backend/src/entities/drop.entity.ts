import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { DropStatus } from '../common/enums/drop.enum';
import { BankAccount } from './bank-account.entity';

@Entity('drops')
export class Drop extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: DropStatus,
    default: DropStatus.ACTIVE,
  })
  status: DropStatus;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.drop)
  bankAccounts: BankAccount[];
}
