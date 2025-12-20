import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { UserRole, UserStatus } from '../common/enums/user.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OPERATOR,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;
}
