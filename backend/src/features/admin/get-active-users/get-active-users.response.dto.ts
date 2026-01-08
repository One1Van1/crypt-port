import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

export class GetActiveUsersItemDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username', required: false })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({
    enum: UserStatus,
    enumName: 'UserStatus',
    description: 'User status',
  })
  status: UserStatus;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Telegram username', required: false })
  telegram?: string;

  @ApiProperty({ description: '2FA enabled' })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Deletion date', required: false, nullable: true })
  deletedAt?: Date | null;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.phone = user.phone;
    this.telegram = user.telegram;
    this.twoFactorEnabled = user.twoFactorEnabled;
    this.createdAt = user.createdAt;
    // BaseEntity has deletedAt
    this.deletedAt = (user as any).deletedAt ?? null;
  }
}

export class GetActiveUsersResponseDto {
  @ApiProperty({ description: 'List of users', type: [GetActiveUsersItemDto] })
  items: GetActiveUsersItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: GetActiveUsersItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
