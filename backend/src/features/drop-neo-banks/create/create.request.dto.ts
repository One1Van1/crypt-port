import { IsEnum, IsString, IsNumber, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NeoBankProvider } from '../../../common/enums/neo-bank.enum';

export class CreateDropNeoBankRequestDto {
  @ApiProperty({
    enum: NeoBankProvider,
    enumName: 'NeoBankProvider',
    example: NeoBankProvider.RIPIO,
    description: 'Neo bank provider',
  })
  @IsEnum(NeoBankProvider)
  provider: NeoBankProvider;

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
    description: 'Optional comment',
    example: 'Main Ripio account',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

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
}
