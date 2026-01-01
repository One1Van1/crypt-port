import { IsOptional, IsEnum, IsString, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export class UpdateDropNeoBankRequestDto {
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
    description: 'Comment',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

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
}
