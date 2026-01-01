import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NeoBankProvider, NeoBankStatus } from '../../../common/enums/neo-bank.enum';

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
    enum: NeoBankProvider,
    description: 'Provider filter',
    required: false,
  })
  @IsOptional()
  @IsEnum(NeoBankProvider)
  provider?: NeoBankProvider;

  @ApiProperty({
    enum: NeoBankStatus,
    description: 'Status filter',
    required: false,
  })
  @IsOptional()
  @IsEnum(NeoBankStatus)
  status?: NeoBankStatus;
}
