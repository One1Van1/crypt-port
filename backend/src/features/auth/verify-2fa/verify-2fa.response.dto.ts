import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user.enum';

export class Verify2faResponseDto {
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  role: UserRole;

  @ApiProperty({ description: 'Message' })
  message: string;

  constructor(accessToken: string, refreshToken: string, user: any) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = user.id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.message = 'Login successful';
  }
}
