import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { Profit } from '../entities/profit.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { Platform } from '../entities/platform.entity';
import { FreeUsdtEntry } from '../entities/free-usdt-entry.entity';
import { FreeUsdtDistribution } from '../entities/free-usdt-distribution.entity';
import { FreeUsdtAdjustment } from '../entities/free-usdt-adjustment.entity';
import { GetFreeUsdtLedgerController } from '../features/free-usdt/get-ledger/get-ledger.controller';
import { GetFreeUsdtLedgerService } from '../features/free-usdt/get-ledger/get-ledger.service';
import { DistributeFreeUsdtController } from '../features/free-usdt/distribute/distribute.controller';
import { DistributeFreeUsdtService } from '../features/free-usdt/distribute/distribute.service';
import { DistributeFreeUsdtBatchController } from '../features/free-usdt/distribute-batch/distribute-batch.controller';
import { DistributeFreeUsdtBatchService } from '../features/free-usdt/distribute-batch/distribute-batch.service';
import { GetFreeUsdtDistributionsController } from '../features/free-usdt/get-distributions/get-distributions.controller';
import { GetFreeUsdtDistributionsService } from '../features/free-usdt/get-distributions/get-distributions.service';
import { MintFreeUsdtController } from '../features/free-usdt/mint/mint.controller';
import { MintFreeUsdtService } from '../features/free-usdt/mint/mint.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PesoToUsdtConversion,
      Profit,
      SystemSetting,
      Platform,
      FreeUsdtEntry,
      FreeUsdtDistribution,
      FreeUsdtAdjustment,
    ]),
  ],
  controllers: [
    GetFreeUsdtLedgerController,
    DistributeFreeUsdtController,
    DistributeFreeUsdtBatchController,
    GetFreeUsdtDistributionsController,
    MintFreeUsdtController,
  ],
  providers: [
    GetFreeUsdtLedgerService,
    DistributeFreeUsdtService,
    DistributeFreeUsdtBatchService,
    GetFreeUsdtDistributionsService,
    MintFreeUsdtService,
  ],
})
export class FreeUsdtModule {}
