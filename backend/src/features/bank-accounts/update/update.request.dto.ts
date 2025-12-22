import { IsString, IsNumber, IsOptional, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankAccountRequestDto {
  @ApiProperty({
    description: 'Alias - minimum 6 characters',
    example: 'updated.alias.wallet',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(6, 100, { message: 'Alias must be between 6 and 100 characters' })
  alias?: string;

  @ApiProperty({
    description: 'Withdrawal limit',
    example: 150000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;
}
