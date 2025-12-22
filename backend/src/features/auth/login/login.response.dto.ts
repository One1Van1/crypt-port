import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Temporary token for 2FA verification' })
  tempToken: string;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Message for user' })
  message: string;

  @ApiProperty({ description: 'Indicates if 2FA is enabled' })
  requires2FA: boolean;

  constructor(tempToken: string, userId: number, requires2FA: boolean) {
    this.tempToken = tempToken;
    this.userId = userId;
    this.requires2FA = requires2FA;
    this.message = requires2FA 
      ? 'Please provide 2FA code to complete login'
      : 'Please enable 2FA to continue';
  }
}
