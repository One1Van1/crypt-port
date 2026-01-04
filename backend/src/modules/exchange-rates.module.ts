import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { SetExchangeRateController } from '../features/exchange-rates/set-rate/set-rate.controller';
import { SetExchangeRateService } from '../features/exchange-rates/set-rate/set-rate.service';
import { GetCurrentRateController } from '../features/exchange-rates/get-current/get-current.controller';
import { GetCurrentRateService } from '../features/exchange-rates/get-current/get-current.service';
import { GetHistoryController } from '../features/exchange-rates/get-history/get-history.controller';
import { GetHistoryService } from '../features/exchange-rates/get-history/get-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate])],
  controllers: [
    SetExchangeRateController,
    GetCurrentRateController,
    GetHistoryController,
  ],
  providers: [
    SetExchangeRateService,
    GetCurrentRateService,
    GetHistoryService,
  ],
})
export class ExchangeRatesModule {}
