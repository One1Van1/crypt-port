import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';

export class AdminUpdateUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Phone', required: false })
  phone?: string;

  @ApiProperty({ description: 'Telegram', required: false })
  telegram?: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', description: 'Role' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', description: 'Status' })
  status: UserStatus;

  @ApiProperty({ description: '2FA enabled' })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.phone = user.phone;
    this.telegram = user.telegram;
    this.role = user.role;
    this.status = user.status;
    this.twoFactorEnabled = user.twoFactorEnabled;
    this.updatedAt = user.updatedAt;
  }
}
