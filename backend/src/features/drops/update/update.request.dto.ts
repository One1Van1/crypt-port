import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDropRequestDto {
  @ApiProperty({
    description: 'Drop name or pseudonym',
    example: 'John Doe',
    minLength: 2,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: 'Additional comment',
    example: 'Updated comment',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
