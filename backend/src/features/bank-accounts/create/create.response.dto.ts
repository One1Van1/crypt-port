import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../entities/bank-account.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class CreateBankAccountResponseDto {
  @ApiProperty({ description: 'Bank account ID' })
  id: number;

  @ApiProperty({ description: 'CBU (22 digits)' })
  cbu: string;

  @ApiProperty({ description: 'Alias' })
  alias: string;

  @ApiProperty({
    enum: BankAccountStatus,
    enumName: 'BankAccountStatus',
    description: 'Bank account status',
  })
  status: BankAccountStatus;

  @ApiProperty({ description: 'Initial limit (set by admin)' })
  initialLimitAmount: number;

  @ApiProperty({ description: 'Current working limit' })
  currentLimitAmount: number;

  @ApiProperty({ description: 'Withdrawn amount (statistics)' })
  withdrawnAmount: number;

  @ApiProperty({ description: 'Priority' })
  priority: number;

  @ApiProperty({ description: 'Bank ID' })
  bankId: number;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Drop ID' })
  dropId: number;

  @ApiProperty({ description: 'Drop name' })
  dropName: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    this.status = bankAccount.status;
    this.initialLimitAmount = Number(bankAccount.initialLimitAmount);
    this.currentLimitAmount = Number(bankAccount.currentLimitAmount);
    this.withdrawnAmount = Number(bankAccount.withdrawnAmount);
    this.priority = bankAccount.priority;
    this.bankId = bankAccount.bank?.id;
    this.bankName = bankAccount.bank?.name;
    this.dropId = bankAccount.drop?.id;
    this.dropName = bankAccount.drop?.name;
    this.createdAt = bankAccount.createdAt;
  }
}
