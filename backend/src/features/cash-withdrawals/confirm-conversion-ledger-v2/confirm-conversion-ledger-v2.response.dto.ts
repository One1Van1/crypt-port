import { ApiProperty } from '@nestjs/swagger';

export class ConfirmConversionLedgerV2ResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'confirmed' })
  status: string;

  @ApiProperty({ example: 100 })
  usdtAmount: number;

  @ApiProperty({ example: true })
  freeUsdtEntryCreated: boolean;

  @ApiProperty({ example: 50 })
  debtRepaidUsdt: number;

  @ApiProperty({ example: 950 })
  debtRemainingUsdt: number;

  constructor(params: {
    id: number;
    status: string;
    usdtAmount: number;
    freeUsdtEntryCreated: boolean;
    debtRepaidUsdt: number;
    debtRemainingUsdt: number;
  }) {
    this.id = params.id;
    this.status = params.status;
    this.usdtAmount = params.usdtAmount;
    this.freeUsdtEntryCreated = params.freeUsdtEntryCreated;
    this.debtRepaidUsdt = params.debtRepaidUsdt;
    this.debtRemainingUsdt = params.debtRemainingUsdt;
  }
}
