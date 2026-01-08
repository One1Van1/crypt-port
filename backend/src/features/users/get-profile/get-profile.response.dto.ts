import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';

export class GetUserProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Telegram username', required: false })
  telegram?: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    description: 'User role',
  })
  role: UserRole;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.phone = user.phone;
    this.telegram = user.telegram;
    this.role = user.role;
  }
}
