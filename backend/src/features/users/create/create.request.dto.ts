import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user.enum';

export class CreateUserRequestDto {
  @ApiProperty({ description: 'Username', example: 'operator1' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Email', example: 'operator1@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'StrongPassword123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    description: 'User role (only operator/teamlead allowed here)',
    required: false,
    example: UserRole.OPERATOR,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
