import { IsOptional, IsNumber, Min, Max, IsUUID, IsDateString, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { UserRole } from '../../../common/enums/user.enum';

export enum UserFilterType {
  MY = 'my',           // только свои
  ALL = 'all',         // все
  OTHERS = 'others',   // только остальных
}

export class GetDropTransactionsForOperatorQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 5,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Filter by user filter type (my/all/others)',
    enum: UserFilterType,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserFilterType)
  userFilter?: UserFilterType;

  @ApiProperty({
    description: 'Filter by user role',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @ApiProperty({
    description: 'Filter by user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Search by username',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Filter by bank name',
    example: 'Banco Galicia',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    description: 'Filter by transaction status',
    enum: TransactionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({
    description: 'Filter from date (ISO string)',
    example: '2025-12-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter to date (ISO string)',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Minimum amount filter',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiProperty({
    description: 'Maximum amount filter',
    example: 10000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}
