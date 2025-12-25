import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { UserRole, UserStatus } from '../common/enums/user.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PENDING,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true, name: 'two_factor_secret' })
  twoFactorSecret: string;

  @Column({ default: false, name: 'two_factor_enabled' })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  telegram: string;
}
