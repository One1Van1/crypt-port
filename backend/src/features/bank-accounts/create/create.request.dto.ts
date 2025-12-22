import { IsString, IsUUID, IsNumber, IsOptional, Length, Matches, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankAccountRequestDto {
  @ApiProperty({
    description: 'CBU - exactly 22 digits',
    example: '1234567890123456789012',
    minLength: 22,
    maxLength: 22,
  })
  @IsString()
  @Length(22, 22, { message: 'CBU must be exactly 22 characters' })
  @Matches(/^\d{22}$/, { message: 'CBU must contain exactly 22 digits' })
  cbu: string;

  @ApiProperty({
    description: 'Alias - minimum 6 characters',
    example: 'john.doe.wallet',
    minLength: 6,
  })
  @IsString()
  @Length(6, 100, { message: 'Alias must be between 6 and 100 characters' })
  alias: string;

  @ApiProperty({
    description: 'Bank ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  bankId: string;

  @ApiProperty({
    description: 'Drop ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  dropId: string;

  @ApiProperty({
    description: 'Withdrawal limit',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiProperty({
    description: 'Priority (lower number = higher priority)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  priority?: number;
}
