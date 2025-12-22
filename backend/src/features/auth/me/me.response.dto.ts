import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

export class MeResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: 'User status' })
  status: UserStatus;

  @ApiProperty({ description: '2FA enabled' })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.twoFactorEnabled = user.twoFactorEnabled;
    this.createdAt = user.createdAt;
  }
}
