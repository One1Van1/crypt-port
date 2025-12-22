import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../entities/bank-account.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

class BankAccountItemDto {
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

  @ApiProperty({ description: 'Block reason', required: false })
  blockReason: string | null;

  @ApiProperty({ description: 'Limit' })
  limit: number;

  @ApiProperty({ description: 'Withdrawn amount' })
  withdrawnAmount: number;

  @ApiProperty({ description: 'Available amount (limit - withdrawn)' })
  availableAmount: number;

  @ApiProperty({ description: 'Priority' })
  priority: number;

  @ApiProperty({ description: 'Last used date', required: false })
  lastUsedAt: Date | null;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Drop name' })
  dropName: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    this.status = bankAccount.status;
    this.blockReason = bankAccount.blockReason;
    this.limit = Number(bankAccount.limit);
    this.withdrawnAmount = Number(bankAccount.withdrawnAmount);
    this.availableAmount = Number(bankAccount.limit) - Number(bankAccount.withdrawnAmount);
    this.priority = bankAccount.priority;
    this.lastUsedAt = bankAccount.lastUsedAt;
    this.bankName = bankAccount.bank?.name || 'Unknown';
    this.dropName = bankAccount.drop?.name || 'Unknown';
    this.createdAt = bankAccount.createdAt;
  }
}

export class GetAllBankAccountsResponseDto {
  @ApiProperty({ description: 'List of bank accounts', type: [BankAccountItemDto] })
  items: BankAccountItemDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(bankAccounts: BankAccount[], total: number) {
    this.items = bankAccounts.map((account) => new BankAccountItemDto(account));
    this.total = total;
  }
}
