import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../entities/bank-account.entity';

export class GetAvailableBankAccountResponseDto {
  @ApiProperty({ description: 'Bank account ID' })
  id: number;

  @ApiProperty({ description: 'CBU (22 digits)' })
  cbu: string;

  @ApiProperty({ description: 'Alias' })
  alias: string;

  @ApiProperty({ description: 'Available amount (limit - withdrawn)' })
  availableAmount: number;

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

  @ApiProperty({ description: 'Last used date', required: false })
  lastUsedAt: Date | null;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    this.availableAmount = Number(bankAccount.limitAmount) - Number(bankAccount.withdrawnAmount);
    this.priority = bankAccount.priority;
    this.bankId = bankAccount.bank?.id;
    this.bankName = bankAccount.bank?.name || 'Unknown';
    this.dropId = bankAccount.drop?.id;
    this.dropName = bankAccount.drop?.name || 'Unknown';
    this.lastUsedAt = bankAccount.lastUsedAt;
  }
}
