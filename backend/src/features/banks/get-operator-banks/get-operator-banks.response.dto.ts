import { ApiProperty } from '@nestjs/swagger';
import { BankStatus } from '../../../common/enums/bank.enum';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

export class BankAccountForOperatorDto {
  @ApiProperty({ description: 'Account ID' })
  id: number;

  @ApiProperty({ description: 'CBU number' })
  cbu: string;

  @ApiProperty({ description: 'Account alias' })
  alias: string;

  @ApiProperty({ enum: BankAccountStatus, description: 'Account status' })
  status: BankAccountStatus;

  @ApiProperty({ description: 'Priority (lower = higher priority)' })
  priority: number;

  @ApiProperty({ description: 'Initial limit amount (set by admin)' })
  initialLimitAmount: number;

  @ApiProperty({ description: 'Current working limit' })
  currentLimitAmount: number;

  @ApiProperty({ description: 'Withdrawn amount' })
  withdrawnAmount: number;

  @ApiProperty({ description: 'Last used timestamp', required: false })
  lastUsedAt: Date | null;

  @ApiProperty({ description: 'Drop name' })
  dropName: string;
}

export class OperatorBankDto {
  @ApiProperty({ description: 'Bank ID' })
  id: number;

  @ApiProperty({ description: 'Bank name' })
  name: string;

  @ApiProperty({ description: 'Bank code', required: false })
  code: string | null;

  @ApiProperty({ enum: BankStatus, description: 'Bank status' })
  status: BankStatus;

  @ApiProperty({ type: [BankAccountForOperatorDto], description: 'Bank accounts sorted by priority' })
  accounts: BankAccountForOperatorDto[];
}

export class GetOperatorBanksResponseDto {
  @ApiProperty({ type: [OperatorBankDto], description: 'List of banks with accounts' })
  banks: OperatorBankDto[];

  constructor(banks: OperatorBankDto[]) {
    this.banks = banks;
  }
}
