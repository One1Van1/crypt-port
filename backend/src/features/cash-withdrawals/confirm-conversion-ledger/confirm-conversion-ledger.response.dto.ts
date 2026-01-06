import { ApiProperty } from '@nestjs/swagger';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';

export class ConfirmConversionLedgerResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ enum: ConversionStatus, example: ConversionStatus.CONFIRMED })
  status: ConversionStatus;

  @ApiProperty({ example: 100.5 })
  usdtAmount: number;

  @ApiProperty({ example: true })
  freeUsdtEntryCreated: boolean;

  constructor(
    id: number,
    status: ConversionStatus,
    usdtAmount: number,
    freeUsdtEntryCreated: boolean,
  ) {
    this.id = id;
    this.status = status;
    this.usdtAmount = usdtAmount;
    this.freeUsdtEntryCreated = freeUsdtEntryCreated;
  }
}
