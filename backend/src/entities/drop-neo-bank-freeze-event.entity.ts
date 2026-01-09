import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { DropNeoBank } from './drop-neo-bank.entity';
import { User } from './user.entity';

export type DropNeoBankFreezeAction = 'freeze' | 'unfreeze';

@Entity('drop_neo_bank_freeze_events')
export class DropNeoBankFreezeEvent extends BaseEntity {
  @Column({ name: 'neo_bank_id' })
  neoBankId: number;

  @ManyToOne(() => DropNeoBank)
  @JoinColumn({ name: 'neo_bank_id' })
  neoBank: DropNeoBank;

  @Column({ name: 'performed_by_user_id' })
  performedByUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by_user_id' })
  performedByUser: User;

  @Column({ type: 'varchar' })
  action: DropNeoBankFreezeAction;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'frozen_amount' })
  frozenAmount: number;
}
