import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

export class RegisterAdminResponseDto {
  @ApiProperty({ description: 'Admin ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: 'User status' })
  status: UserStatus;

  @ApiProperty({ description: 'Message for admin' })
  message: string;

  @ApiProperty({ description: 'Temporary token to get QR code' })
  tempToken: string;

  constructor(user: any, tempToken: string) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.message = 'Admin successfully registered. Use tempToken to get QR code for 2FA setup.';
    this.tempToken = tempToken;
  }
}
