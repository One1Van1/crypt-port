import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatformRequestDto {
  @ApiProperty({
    description: 'Platform name',
    example: 'Binance P2P',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;
}
