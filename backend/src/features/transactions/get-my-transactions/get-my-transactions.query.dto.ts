import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

export class GetMyTransactionsQueryDto {
  @ApiProperty({ description: 'Page number', example: 1, minimum: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 10, minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    enum: TransactionStatus,
    enumName: 'TransactionStatus',
    required: false,
    description: 'Filter by transaction status',
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({
    description: 'Filter by platform ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  platformId?: number;

  @ApiProperty({
    description: 'Filter by shift ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  shiftId?: string;

  @ApiProperty({
    description: 'Filter by start date (ISO format)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by end date (ISO format)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
