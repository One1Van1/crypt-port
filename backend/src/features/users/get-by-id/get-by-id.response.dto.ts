import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';

export class GetUserByIdResponseDto {
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

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.role = user.role;
    this.twoFactorEnabled = user.twoFactorEnabled;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
