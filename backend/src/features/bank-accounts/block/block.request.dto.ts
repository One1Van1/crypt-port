import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockBankAccountRequestDto {
  @ApiProperty({
    description: 'Reason for blocking the account',
    example: 'Limit exceeded',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Block reason must be at least 3 characters' })
  reason: string;
}
