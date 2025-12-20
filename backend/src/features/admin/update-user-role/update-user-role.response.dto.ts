import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user.enum';

export class UpdateUserRoleResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ enum: UserRole, description: 'Updated role' })
  role: UserRole;

  @ApiProperty({ description: 'Message' })
  message: string;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.role = user.role;
    this.message = 'User role updated successfully';
  }
}
