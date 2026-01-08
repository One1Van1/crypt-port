import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';

export class CreateUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', description: 'User role' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', description: 'User status' })
  status: UserStatus;

  @ApiProperty({ description: 'Message' })
  message: string;

  @ApiProperty({ description: 'Temporary token to get QR code' })
  tempToken: string;

  constructor(user: User, tempToken: string) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.message = 'User created. Use tempToken to get QR code for 2FA setup.';
    this.tempToken = tempToken;
  }
}
