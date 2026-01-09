import { IsString, IsNumber, IsOptional, MinLength, Min, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDropNeoBankRequestDto {
  @ApiProperty({
    description: 'Neo bank provider (free-text bank name)',
    example: 'Ripio',
  })
  @IsString()
  @MinLength(1)
  provider: string;

  @ApiProperty({
    description: 'Account ID in neo bank',
    example: 'cuenta.ivan2024',
    minimum: 3,
  })
  @IsString()
  @MinLength(3)
  accountId: string;

  @ApiProperty({
    description: 'Drop ID',
    example: 1,
  })
  @IsNumber()
  dropId: number;

  @ApiProperty({
    description: 'Platform ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  platformId: number;

  @ApiProperty({
    description: 'Optional alias',
    example: 'BYBIT.YONT.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({
    description: 'Current balance in ARS',
    example: 500000,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentBalance?: number;

  @ApiProperty({
    description: 'Daily limit in ARS',
    example: 250000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLimit?: number;

  @ApiProperty({
    description: 'Monthly limit in ARS',
    example: 2000000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyLimit?: number;
}
