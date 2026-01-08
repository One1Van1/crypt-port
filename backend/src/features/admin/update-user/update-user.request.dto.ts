import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

export class AdminUpdateUserRequestDto {
  @ApiProperty({ description: 'Username', required: false, example: 'operator1' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiProperty({ description: 'Email', required: false, example: 'operator1@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'New password', required: false, example: 'NewSecurePassword123!' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  @ApiProperty({ description: 'Phone', required: false, example: '+7 999 123-45-67' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'Telegram', required: false, example: '@operator1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telegram?: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
