import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BankStatus } from '../../../common/enums/bank.enum';

export class UpdateBankStatusRequestDto {
  @ApiProperty({
    enum: BankStatus,
    enumName: 'BankStatus',
    description: 'New bank status',
    example: BankStatus.ACTIVE,
  })
  @IsEnum(BankStatus)
  status: BankStatus;
}
