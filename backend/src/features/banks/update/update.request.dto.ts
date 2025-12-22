import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankRequestDto {
  @ApiProperty({
    description: 'Bank name',
    example: 'Banco Galicia',
    minLength: 2,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'Bank code',
    example: 'GALI',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;
}
