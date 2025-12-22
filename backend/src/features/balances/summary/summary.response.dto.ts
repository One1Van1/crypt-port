import { ApiProperty } from '@nestjs/swagger';

export class PlatformBalanceDto {
  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Main balance' })
  mainBalance: number;

  @ApiProperty({ description: 'Reserve balance' })
  reserveBalance: number;

  @ApiProperty({ description: 'Total balance' })
  totalBalance: number;

  constructor(platformId: number, platformName: string, main: number, reserve: number) {
    this.platformId = platformId;
    this.platformName = platformName;
    this.mainBalance = Math.round(main * 100) / 100;
    this.reserveBalance = Math.round(reserve * 100) / 100;
    this.totalBalance = Math.round((main + reserve) * 100) / 100;
  }
}

export class GetBalancesSummaryResponseDto {
  @ApiProperty({ description: 'Balances by platform', type: [PlatformBalanceDto] })
  platforms: PlatformBalanceDto[];

  @ApiProperty({ description: 'Total main balance across all platforms' })
  totalMain: number;

  @ApiProperty({ description: 'Total reserve balance across all platforms' })
  totalReserve: number;

  @ApiProperty({ description: 'Grand total balance' })
  totalAmount: number;

  constructor(platforms: PlatformBalanceDto[], totalMain: number, totalReserve: number, totalAmount: number) {
    this.platforms = platforms;
    this.totalMain = Math.round(totalMain * 100) / 100;
    this.totalReserve = Math.round(totalReserve * 100) / 100;
    this.totalAmount = Math.round(totalAmount * 100) / 100;
  }
}
