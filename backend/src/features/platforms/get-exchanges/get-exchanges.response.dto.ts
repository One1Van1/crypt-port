import { ApiProperty } from '@nestjs/swagger';
import { UsdtToPesoExchange } from '../../../entities/usdt-to-peso-exchange.entity';

class PlatformExchangeItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  platformId: number;

  @ApiProperty()
  platformName: string;

  @ApiProperty()
  usdtAmount: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  pesosAmount: number;

  @ApiProperty()
  createdAt: Date;

  constructor(exchange: UsdtToPesoExchange) {
    this.id = exchange.id;
    this.platformId = exchange.platformId;
    this.platformName = exchange.platform?.name || '';
    this.usdtAmount = Number(exchange.usdtAmount);
    this.exchangeRate = Number(exchange.exchangeRate);
    this.pesosAmount = Number(exchange.pesosAmount);
    this.createdAt = exchange.createdAt;
  }
}

export class GetPlatformExchangesResponseDto {
  @ApiProperty({ type: [PlatformExchangeItemDto] })
  items: PlatformExchangeItemDto[];

  @ApiProperty()
  total: number;

  constructor(exchanges: UsdtToPesoExchange[], total: number) {
    this.items = exchanges.map(e => new PlatformExchangeItemDto(e));
    this.total = total;
  }
}
