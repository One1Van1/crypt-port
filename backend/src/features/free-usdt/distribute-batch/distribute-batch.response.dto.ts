import { ApiProperty } from '@nestjs/swagger';

export class DistributeFreeUsdtBatchResultItemDto {
  @ApiProperty({ example: 123 })
  distributionId: number;

  @ApiProperty({ example: 1 })
  platformId: number;

  @ApiProperty({ example: 50 })
  amountUsdt: number;

  @ApiProperty({ example: 1500 })
  platformBalanceAfter: number;

  constructor(params: {
    distributionId: number;
    platformId: number;
    amountUsdt: number;
    platformBalanceAfter: number;
  }) {
    this.distributionId = params.distributionId;
    this.platformId = params.platformId;
    this.amountUsdt = params.amountUsdt;
    this.platformBalanceAfter = params.platformBalanceAfter;
  }
}

export class DistributeFreeUsdtBatchResponseDto {
  @ApiProperty({ type: [DistributeFreeUsdtBatchResultItemDto] })
  items: DistributeFreeUsdtBatchResultItemDto[];

  @ApiProperty({ example: 150 })
  totalDistributedUsdt: number;

  @ApiProperty({ example: 400 })
  freeUsdtBefore: number;

  @ApiProperty({ example: 250 })
  freeUsdtAfter: number;

  @ApiProperty({ example: 1 })
  distributedByUserId: number;

  @ApiProperty()
  createdAt: Date;

  constructor(params: {
    items: DistributeFreeUsdtBatchResultItemDto[];
    totalDistributedUsdt: number;
    freeUsdtBefore: number;
    freeUsdtAfter: number;
    distributedByUserId: number;
    createdAt: Date;
  }) {
    this.items = params.items;
    this.totalDistributedUsdt = params.totalDistributedUsdt;
    this.freeUsdtBefore = params.freeUsdtBefore;
    this.freeUsdtAfter = params.freeUsdtAfter;
    this.distributedByUserId = params.distributedByUserId;
    this.createdAt = params.createdAt;
  }
}
