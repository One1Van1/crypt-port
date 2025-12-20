import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user.enum';

export class UpdateUserRoleRequestDto {
  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.OPERATOR,
    description: 'New role for the user',
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
