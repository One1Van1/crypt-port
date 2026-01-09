import { IsOptional, IsEnum, IsString, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export class UpdateDropNeoBankRequestDto {
  @ApiProperty({
    description: 'Provider (free-text bank name)',
    example: 'Ripio',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  provider?: string;

  @ApiProperty({
    description: 'Drop ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  dropId?: number;

  @ApiProperty({
    description: 'Platform ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  platformId?: number;

  @ApiProperty({
    description: 'Account ID in neo bank',
    example: 'cuenta.ivan2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  accountId?: string;

  @ApiProperty({
    enum: NeoBankStatus,
    description: 'Status',
    required: false,
  })
  @IsOptional()
  @IsEnum(NeoBankStatus)
  status?: NeoBankStatus;

  @ApiProperty({
    description: 'Alias',
    required: false,
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({
    description: 'Current balance in ARS (for display, use update-balance endpoint for operations)',
    example: 500000,
    minimum: 0,
    required: false,
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
  @Type(() => Number)
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
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyLimit?: number;
}
