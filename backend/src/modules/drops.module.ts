import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drop } from '../entities/drop.entity';

// Create
import { CreateDropController } from '../features/drops/create/create.controller';
import { CreateDropService } from '../features/drops/create/create.service';

// Get All
import { GetAllDropsController } from '../features/drops/get-all/get-all.controller';
import { GetAllDropsService } from '../features/drops/get-all/get-all.service';

// Get By ID
import { GetDropByIdController } from '../features/drops/get-by-id/get-by-id.controller';
import { GetDropByIdService } from '../features/drops/get-by-id/get-by-id.service';

// Update
import { UpdateDropController } from '../features/drops/update/update.controller';
import { UpdateDropService } from '../features/drops/update/update.service';

// Update Status
import { UpdateDropStatusController } from '../features/drops/update-status/update-status.controller';
import { UpdateDropStatusService } from '../features/drops/update-status/update-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Drop])],
  controllers: [
    CreateDropController,
    GetAllDropsController,
    GetDropByIdController,
    UpdateDropController,
    UpdateDropStatusController,
  ],
  providers: [
    CreateDropService,
    GetAllDropsService,
    GetDropByIdService,
    UpdateDropService,
    UpdateDropStatusService,
  ],
})
export class DropsModule {}
