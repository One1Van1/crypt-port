import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../entities/bank-account.entity';

export class GetAvailableBankAccountResponseDto {
  @ApiProperty({ description: 'Bank account ID' })
  id: number;

  @ApiProperty({ description: 'CBU (22 digits)' })
  cbu: string;

  @ApiProperty({ description: 'Alias' })
  alias: string;

  @ApiProperty({ description: 'Current working limit (available amount)' })
  currentLimitAmount: number;

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

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    // currentLimitAmount - уже доступный лимит
    this.currentLimitAmount = typeof bankAccount.currentLimitAmount === 'string' 
      ? parseFloat(bankAccount.currentLimitAmount) 
      : bankAccount.currentLimitAmount;
    this.priority = bankAccount.priority;
    this.bankId = bankAccount.bankId;
    this.bankName = bankAccount.bank?.name || '';
    this.dropId = bankAccount.dropId;
    this.dropName = bankAccount.drop?.name || '';
  }
}
