import { ApiProperty } from '@nestjs/swagger';
import { FreeUsdtAdjustmentReason } from '../../../entities/free-usdt-adjustment.entity';

export class MintFreeUsdtResponseDto {
  @ApiProperty({ example: 123 })
  adjustmentId: number;

  @ApiProperty({ example: 100 })
  amountUsdt: number;

  @ApiProperty({ enum: FreeUsdtAdjustmentReason, enumName: 'FreeUsdtAdjustmentReason' })
  reason: FreeUsdtAdjustmentReason;

  @ApiProperty({ example: 1 })
  createdByUserId: number;

  @ApiProperty({ example: '2026-01-17T12:34:56.000Z' })
  createdAt: string;

  constructor(params: {
    adjustmentId: number;
    amountUsdt: number;
    reason: FreeUsdtAdjustmentReason;
    createdByUserId: number;
    createdAt: string;
  }) {
    this.adjustmentId = params.adjustmentId;
    this.amountUsdt = params.amountUsdt;
    this.reason = params.reason;
    this.createdByUserId = params.createdByUserId;
    this.createdAt = params.createdAt;
  }
}
