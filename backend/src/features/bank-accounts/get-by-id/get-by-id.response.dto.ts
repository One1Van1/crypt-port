import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../entities/bank-account.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class GetBankAccountByIdResponseDto {
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

  @ApiProperty({ description: 'Bank ID' })
  bankId: number;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Drop ID' })
  dropId: number;

  @ApiProperty({ description: 'Drop name' })
  dropName: string;

  @ApiProperty({ description: 'Number of transactions' })
  transactionsCount: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    this.status = bankAccount.status;
    this.blockReason = bankAccount.blockReason;
    this.limit = Number(bankAccount.limitAmount);
    this.withdrawnAmount = Number(bankAccount.withdrawnAmount);
    this.availableAmount = Number(bankAccount.limitAmount) - Number(bankAccount.withdrawnAmount);
    this.priority = bankAccount.priority;
    this.lastUsedAt = bankAccount.lastUsedAt;
    this.bankId = bankAccount.bank?.id;
    this.bankName = bankAccount.bank?.name || 'Unknown';
    this.dropId = bankAccount.drop?.id;
    this.dropName = bankAccount.drop?.name || 'Unknown';
    this.transactionsCount = bankAccount.transactions?.length || 0;
    this.createdAt = bankAccount.createdAt;
    this.updatedAt = bankAccount.updatedAt;
  }
}
