import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from '../entities/platform.entity';
import { UsdtToPesoExchange } from '../entities/usdt-to-peso-exchange.entity';

// Create
import { CreatePlatformController } from '../features/platforms/create/create.controller';
import { CreatePlatformService } from '../features/platforms/create/create.service';

// Get All
import { GetAllPlatformsController } from '../features/platforms/get-all/get-all.controller';
import { GetAllPlatformsService } from '../features/platforms/get-all/get-all.service';

// Get Exchanges
import { GetPlatformExchangesController } from '../features/platforms/get-exchanges/get-exchanges.controller';
import { GetPlatformExchangesService } from '../features/platforms/get-exchanges/get-exchanges.service';

// Get By ID
import { GetPlatformByIdController } from '../features/platforms/get-by-id/get-by-id.controller';
import { GetPlatformByIdService } from '../features/platforms/get-by-id/get-by-id.service';

// Update
import { UpdatePlatformController } from '../features/platforms/update/update.controller';
import { UpdatePlatformService } from '../features/platforms/update/update.service';

// Update Status
import { UpdatePlatformStatusController } from '../features/platforms/update-status/update-status.controller';
import { UpdatePlatformStatusService } from '../features/platforms/update-status/update-status.service';

// Update Rate
import { UpdateExchangeRateController } from '../features/platforms/update-rate/update-rate.controller';
import { UpdateExchangeRateService } from '../features/platforms/update-rate/update-rate.service';

// Delete
import { DeletePlatformController } from '../features/platforms/delete/delete.controller';
import { DeletePlatformService } from '../features/platforms/delete/delete.service';

@Module({
  imports: [TypeOrmModule.forFeature([Platform, UsdtToPesoExchange])],
  controllers: [
    CreatePlatformController,
    GetAllPlatformsController,
    GetPlatformExchangesController,
    GetPlatformByIdController,
    UpdatePlatformController,
    UpdatePlatformStatusController,
    UpdateExchangeRateController,
    DeletePlatformController,
  ],
  providers: [
    CreatePlatformService,
    GetAllPlatformsService,
    GetPlatformExchangesService,
    GetPlatformByIdService,
    UpdatePlatformService,
    UpdatePlatformStatusService,
    UpdateExchangeRateService,
    DeletePlatformService,
  ],
})
export class PlatformsModule {}
