import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class UpdateBankAccountStatusRequestDto {
  @ApiProperty({
    enum: BankAccountStatus,
    enumName: 'BankAccountStatus',
    description: 'New bank account status',
    example: BankAccountStatus.WORKING,
  })
  @IsEnum(BankAccountStatus)
  status: BankAccountStatus;
}
