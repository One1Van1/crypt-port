import { IsNumber, IsUUID, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BalanceType } from '../../../common/enums/balance.enum';

export class CreateBalanceRequestDto {
  @ApiProperty({
    description: 'Initial balance amount',
    example: 1000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    enum: BalanceType,
    enumName: 'BalanceType',
    example: BalanceType.START_DEPOSIT,
    description: 'Balance type',
  })
  @IsEnum(BalanceType)
  type: BalanceType;

  @ApiProperty({
    description: 'Platform ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  platformId: string;
}
