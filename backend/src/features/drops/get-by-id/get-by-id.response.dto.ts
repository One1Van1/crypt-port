import { ApiProperty } from '@nestjs/swagger';
import { Drop } from '../../../entities/drop.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { DropStatus } from '../../../common/enums/drop.enum';
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

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Withdrawn amount' })
  withdrawnAmount: number;

  @ApiProperty({ description: 'Initial limit (set by admin)' })
  initialLimitAmount: number;

  @ApiProperty({ description: 'Current working limit' })
  currentLimitAmount: number;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.cbu = bankAccount.cbu;
    this.alias = bankAccount.alias;
    this.status = bankAccount.status;
    this.bankName = bankAccount.bank?.name || 'Unknown';
    this.withdrawnAmount = Number(bankAccount.withdrawnAmount);
    this.initialLimitAmount = Number(bankAccount.initialLimitAmount);
    this.currentLimitAmount = Number(bankAccount.currentLimitAmount);
  }
}

export class GetDropByIdResponseDto {
  @ApiProperty({ description: 'Drop ID' })
  id: number;

  @ApiProperty({ description: 'Drop name' })
  name: string;

  @ApiProperty({ description: 'Comment', required: false })
  comment: string | null;

  @ApiProperty({
    enum: DropStatus,
    enumName: 'DropStatus',
    description: 'Drop status',
  })
  status: DropStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Bank accounts', type: [BankAccountItemDto] })
  bankAccounts: BankAccountItemDto[];

  constructor(drop: Drop) {
    this.id = drop.id;
    this.name = drop.name;
    this.comment = drop.comment;
    this.status = drop.status;
    this.createdAt = drop.createdAt;
    this.updatedAt = drop.updatedAt;
    this.bankAccounts = drop.bankAccounts
      ? drop.bankAccounts.map((ba) => new BankAccountItemDto(ba))
      : [];
  }
}
