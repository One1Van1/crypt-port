import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BankStatus } from '../common/enums/bank.enum';

@Entity('banks')
export class Bank extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({
    type: 'enum',
    enum: BankStatus,
    default: BankStatus.ACTIVE,
  })
  status: BankStatus;
}
