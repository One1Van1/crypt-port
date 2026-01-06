import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { Profit } from '../entities/profit.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { Platform } from '../entities/platform.entity';
import { FreeUsdtEntry } from '../entities/free-usdt-entry.entity';
import { FreeUsdtDistribution } from '../entities/free-usdt-distribution.entity';
import { GetFreeUsdtLedgerController } from '../features/free-usdt/get-ledger/get-ledger.controller';
import { GetFreeUsdtLedgerService } from '../features/free-usdt/get-ledger/get-ledger.service';
import { DistributeFreeUsdtController } from '../features/free-usdt/distribute/distribute.controller';
import { DistributeFreeUsdtService } from '../features/free-usdt/distribute/distribute.service';
import { GetFreeUsdtDistributionsController } from '../features/free-usdt/get-distributions/get-distributions.controller';
import { GetFreeUsdtDistributionsService } from '../features/free-usdt/get-distributions/get-distributions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PesoToUsdtConversion,
      Profit,
      SystemSetting,
      Platform,
      FreeUsdtEntry,
      FreeUsdtDistribution,
    ]),
  ],
  controllers: [
    GetFreeUsdtLedgerController,
    DistributeFreeUsdtController,
    GetFreeUsdtDistributionsController,
  ],
  providers: [GetFreeUsdtLedgerService, DistributeFreeUsdtService, GetFreeUsdtDistributionsService],
})
export class FreeUsdtModule {}
