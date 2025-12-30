import { IsString, IsNumber, IsOptional, Length, Matches, Min, Max } from 'class-validator';
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
    example: 1,
  })
  @IsNumber()
  bankId: number;

  @ApiProperty({
    description: 'Drop ID',
    example: 1,
  })
  @IsNumber()
  dropId: number;

  @ApiProperty({
    description: 'Withdrawal limit',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  limitAmount: number;

  @ApiProperty({
    description: 'Priority (lower number = higher priority, from 1 to 99)',
    example: 1,
    minimum: 1,
    maximum: 99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  priority?: number;
}
