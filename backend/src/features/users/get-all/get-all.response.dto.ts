import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';

export class UserItemDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({ description: '2FA enabled' })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.role = user.role;
    this.twoFactorEnabled = user.twoFactorEnabled;
    this.createdAt = user.createdAt;
  }
}

export class GetAllUsersResponseDto {
  @ApiProperty({ description: 'List of users', type: [UserItemDto] })
  items: UserItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: UserItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
