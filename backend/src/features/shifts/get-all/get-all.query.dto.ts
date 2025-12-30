import { IsOptional, IsEnum, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { Type } from 'class-transformer';

export class GetAllShiftsQueryDto {
  @ApiProperty({
    enum: ShiftStatus,
    enumName: 'ShiftStatus',
    description: 'Filter by shift status',
    required: false,
  })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @ApiProperty({
    description: 'Filter by operator ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @ApiProperty({
    description: 'Filter by platform ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  platformId?: string;

  @ApiProperty({
    description: 'Filter by start date (from)',
    example: '2025-12-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by end date (to)',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 1000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}
