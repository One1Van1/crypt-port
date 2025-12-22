import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlatformRequestDto {
  @ApiProperty({
    description: 'Platform name',
    example: 'Binance P2P',
    minLength: 2,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
