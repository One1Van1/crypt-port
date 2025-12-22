import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../entities/bank-account.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class BlockBankAccountResponseDto {
  @ApiProperty({ description: 'Bank account ID' })
  id: string;

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

  @ApiProperty({ description: 'Block reason' })
  blockReason: string;

  @ApiProperty({ description: 'Withdrawn amount at the time of blocking' })
  withdrawnAmount: number;

  @ApiProperty({ description: 'Limit' })
  limit: number;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Drop name' })
  dropName: string;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    this.status = bankAccount.status;
    this.blockReason = bankAccount.blockReason;
    this.withdrawnAmount = Number(bankAccount.withdrawnAmount);
    this.limit = Number(bankAccount.limit);
    this.bankName = bankAccount.bank?.name || 'Unknown';
    this.dropName = bankAccount.drop?.name || 'Unknown';
    this.updatedAt = bankAccount.updatedAt;
  }
}
