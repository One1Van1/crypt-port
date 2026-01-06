import { ApiProperty } from '@nestjs/swagger';

export class FreeUsdtDistributionItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  platformId: number;

  @ApiProperty()
  platformName: string;

  @ApiProperty()
  amountUsdt: number;

  @ApiProperty()
  distributedByUserId: number;

  @ApiProperty()
  distributedByUserName: string;

  @ApiProperty({ required: false })
  comment: string | null;

  @ApiProperty()
  createdAt: Date;

  constructor(
    id: number,
    platformId: number,
    platformName: string,
    amountUsdt: number,
    distributedByUserId: number,
    distributedByUserName: string,
    comment: string | null,
    createdAt: Date,
  ) {
    this.id = id;
    this.platformId = platformId;
    this.platformName = platformName;
    this.amountUsdt = amountUsdt;
    this.distributedByUserId = distributedByUserId;
    this.distributedByUserName = distributedByUserName;
    this.comment = comment;
    this.createdAt = createdAt;
  }
}

export class GetFreeUsdtDistributionsResponseDto {
  @ApiProperty({ type: [FreeUsdtDistributionItemDto] })
  items: FreeUsdtDistributionItemDto[];

  @ApiProperty()
  total: number;

  constructor(items: FreeUsdtDistributionItemDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
