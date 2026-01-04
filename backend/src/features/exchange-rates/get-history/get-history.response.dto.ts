import { ApiProperty } from '@nestjs/swagger';
import { ExchangeRateResponseDto } from '../set-rate/set-rate.response.dto';

export class GetHistoryResponseDto {
  @ApiProperty({ description: 'List of exchange rates', type: [ExchangeRateResponseDto] })
  items: ExchangeRateResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  constructor(items: ExchangeRateResponseDto[], total: number) {
    this.items = items;
    this.total = total;
  }
}
