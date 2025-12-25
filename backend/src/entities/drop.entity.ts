import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { DropStatus } from '../common/enums/drop.enum';
import { BankAccount } from './bank-account.entity';
import { User } from './user.entity';

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

  @Column({ nullable: true, name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.drop)
  bankAccounts: BankAccount[];
}
