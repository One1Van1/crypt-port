import { ApiProperty } from '@nestjs/swagger';

export class DistributeFreeUsdtResponseDto {
  @ApiProperty({ example: 123 })
  distributionId: number;

  @ApiProperty({ example: 1 })
  platformId: number;

  @ApiProperty({ example: 50 })
  amountUsdt: number;

  @ApiProperty({ example: 1500 })
  platformBalanceAfter: number;

  @ApiProperty({ example: 1 })
  distributedByUserId: number;

  @ApiProperty()
  createdAt: Date;

  constructor(
    distributionId: number,
    platformId: number,
    amountUsdt: number,
    platformBalanceAfter: number,
    distributedByUserId: number,
    createdAt: Date,
  ) {
    this.distributionId = distributionId;
    this.platformId = platformId;
    this.amountUsdt = amountUsdt;
    this.platformBalanceAfter = platformBalanceAfter;
    this.distributedByUserId = distributedByUserId;
    this.createdAt = createdAt;
  }
}
