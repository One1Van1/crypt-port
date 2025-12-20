import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  constructor() {
    this.message = 'Logout successful';
  }
}
