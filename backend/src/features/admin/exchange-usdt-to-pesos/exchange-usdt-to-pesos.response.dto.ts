import { ApiProperty } from '@nestjs/swagger';

export class ExchangeUsdtToPesosResponseDto {
  @ApiProperty({ description: 'Exchange record ID' })
  id: number;

  @ApiProperty({ description: 'Platform ID' })
  platformId: number;

  @ApiProperty({ description: 'Platform name' })
  platformName: string;

  @ApiProperty({ description: 'Neo Bank ID' })
  neoBankId: number;

  @ApiProperty({ description: 'Neo Bank provider' })
  neoBankProvider: string;

  @ApiProperty({ description: 'USDT amount exchanged' })
  usdtAmount: number;

  @ApiProperty({ description: 'Exchange rate used (ARS per 1 USDT)' })
  exchangeRate: number;

  @ApiProperty({ description: 'Pesos amount received' })
  pesosAmount: number;

  @ApiProperty({ description: 'Created by user ID' })
  createdByUserId: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  constructor(
    id: number,
    platformId: number,
    platformName: string,
    neoBankId: number,
    neoBankProvider: string,
    usdtAmount: number,
    exchangeRate: number,
    pesosAmount: number,
    createdByUserId: number,
    createdAt: Date,
  ) {
    this.id = id;
    this.platformId = platformId;
    this.platformName = platformName;
    this.neoBankId = neoBankId;
    this.neoBankProvider = neoBankProvider;
    this.usdtAmount = Number(usdtAmount);
    this.exchangeRate = Number(exchangeRate);
    this.pesosAmount = Number(pesosAmount);
    this.createdByUserId = createdByUserId;
    this.createdAt = createdAt;
  }
}
