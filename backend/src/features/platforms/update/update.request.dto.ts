import { IsString, IsOptional, MinLength, IsNumber, Min } from 'class-validator';
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

  @ApiProperty({
    description: 'Exchange rate (1 USDT = X ARS)',
    example: 1150.50,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;
}
