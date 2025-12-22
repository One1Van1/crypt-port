import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BalanceType } from '../../../common/enums/balance.enum';

export class GetAllBalancesQueryDto {
  @ApiProperty({
    enum: BalanceType,
    enumName: 'BalanceType',
    description: 'Filter by balance type',
    required: false,
  })
  @IsOptional()
  @IsEnum(BalanceType)
  type?: BalanceType;

  @ApiProperty({
    description: 'Filter by platform ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  platformId?: string;
}
