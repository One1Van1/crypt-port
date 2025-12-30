import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class GetAllBankAccountsQueryDto {
  @ApiProperty({
    enum: BankAccountStatus,
    enumName: 'BankAccountStatus',
    description: 'Filter by bank account status',
    required: false,
  })
  @IsOptional()
  @IsEnum(BankAccountStatus)
  status?: BankAccountStatus;

  @ApiProperty({
    description: 'Filter by bank ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  bankId?: string;

  @ApiProperty({
    description: 'Filter by drop ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  dropId?: string;

  @ApiProperty({
    description: 'Search by CBU or alias',
    example: 'john.doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
