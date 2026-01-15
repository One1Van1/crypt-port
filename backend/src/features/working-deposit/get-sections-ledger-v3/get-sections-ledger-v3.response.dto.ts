import { ApiProperty } from '@nestjs/swagger';
import { GetWorkingDepositSectionsLedgerV2ResponseDto } from '../get-sections-ledger-v2/get-sections-ledger-v2.response.dto';

export class DebtV3Section {
  @ApiProperty({ description: 'Debt impact on working deposit (negative value)', example: -1000 })
  totalUsdt: number;

  @ApiProperty({ description: 'Current debt (positive value)', example: 1000 })
  currentDebtUsdt: number;

  @ApiProperty({ description: 'Total debt repaid from conversions', example: 500 })
  totalRepaidUsdt: number;

  constructor(params: { currentDebtUsdt: number; totalRepaidUsdt: number }) {
    this.currentDebtUsdt = params.currentDebtUsdt;
    this.totalRepaidUsdt = params.totalRepaidUsdt;
    this.totalUsdt = -params.currentDebtUsdt;
  }
}

export class GetWorkingDepositSectionsLedgerV3ResponseDto extends GetWorkingDepositSectionsLedgerV2ResponseDto {
  @ApiProperty({ type: DebtV3Section })
  debt: DebtV3Section;

  constructor(params: ConstructorParameters<typeof GetWorkingDepositSectionsLedgerV2ResponseDto>[0] & {
    debt: DebtV3Section;
  }) {
    super(params);
    this.debt = params.debt;
  }
}
