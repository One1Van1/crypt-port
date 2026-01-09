import { ApiProperty } from '@nestjs/swagger';

export class ReserveProfitV2ResponseDto {
  @ApiProperty({ example: '2026-01-06' })
  date: string;

  @ApiProperty({ description: 'Working deposit (USDT) at the moment of reservation', example: 1234.56 })
  workingDepositUsdt: number;

  @ApiProperty({ description: 'Initial deposit (USDT)', example: 1000 })
  initialDepositUsdt: number;

  @ApiProperty({ description: 'Delta = workingDepositUsdt - initialDepositUsdt', example: 234.56 })
  deltaUsdt: number;

  @ApiProperty({ description: 'How much profit was additionally reserved in this call (>=0)', example: 234.56 })
  reservedProfitUsdt: number;

  @ApiProperty({ description: 'How much deficit was recorded for this date (>=0)', example: 0 })
  deficitUsdt: number;

  constructor(params: {
    date: string;
    workingDepositUsdt: number;
    initialDepositUsdt: number;
    deltaUsdt: number;
    reservedProfitUsdt: number;
    deficitUsdt: number;
  }) {
    this.date = params.date;
    this.workingDepositUsdt = params.workingDepositUsdt;
    this.initialDepositUsdt = params.initialDepositUsdt;
    this.deltaUsdt = params.deltaUsdt;
    this.reservedProfitUsdt = params.reservedProfitUsdt;
    this.deficitUsdt = params.deficitUsdt;
  }
}
