import { IsOptional, IsEnum, IsNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export class GetAllDropNeoBanksQueryDto {
  @ApiProperty({
    description: 'Drop ID filter',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dropId?: number;

  @ApiProperty({
    description: 'Platform ID filter',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  platformId?: number;

  @ApiProperty({
    description: 'Provider filter (free-text bank name)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  provider?: string;

  @ApiProperty({
    enum: NeoBankStatus,
    description: 'Status filter',
    required: false,
  })
  @IsOptional()
  @IsEnum(NeoBankStatus)
  status?: NeoBankStatus;
}
