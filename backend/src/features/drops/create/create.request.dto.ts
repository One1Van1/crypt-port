import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDropRequestDto {
  @ApiProperty({
    description: 'Drop name or pseudonym',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Additional comment',
    example: 'Primary drop for platform A',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
