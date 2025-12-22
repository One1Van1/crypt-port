import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BankStatus } from '../../../common/enums/bank.enum';

export class GetAllBanksQueryDto {
  @ApiProperty({
    enum: BankStatus,
    enumName: 'BankStatus',
    description: 'Filter by bank status',
    required: false,
  })
  @IsOptional()
  @IsEnum(BankStatus)
  status?: BankStatus;

  @ApiProperty({
    description: 'Search by name or code',
    example: 'Galicia',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
