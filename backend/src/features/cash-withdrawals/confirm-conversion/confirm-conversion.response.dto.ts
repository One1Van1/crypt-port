import { ApiProperty } from '@nestjs/swagger';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';

export class ConfirmConversionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: ConversionStatus })
  status: ConversionStatus;

  @ApiProperty()
  usdtAmount: number;

  constructor(id: number, status: ConversionStatus, usdtAmount: number) {
    this.id = id;
    this.status = status;
    this.usdtAmount = usdtAmount;
  }
}
