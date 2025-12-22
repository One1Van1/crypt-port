import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DropStatus } from '../../../common/enums/drop.enum';

export class GetAllDropsQueryDto {
  @ApiProperty({
    enum: DropStatus,
    enumName: 'DropStatus',
    description: 'Filter by drop status',
    required: false,
  })
  @IsOptional()
  @IsEnum(DropStatus)
  status?: DropStatus;

  @ApiProperty({
    description: 'Search by name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
