import { IsString, MinLength, IsNumber, Min, IsOptional } from 'class-validator';
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

  @ApiProperty({
    description: 'Exchange rate (1 USDT = X ARS)',
    example: 1150.50,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;
}
