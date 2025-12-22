import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';

export class UpdateUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.role = user.role;
    this.updatedAt = user.updatedAt;
  }
}
