import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from '../entities/bank.entity';

// Create
import { CreateBankController } from '../features/banks/create/create.controller';
import { CreateBankService } from '../features/banks/create/create.service';

// Get All
import { GetAllBanksController } from '../features/banks/get-all/get-all.controller';
import { GetAllBanksService } from '../features/banks/get-all/get-all.service';

// Get By ID
import { GetBankByIdController } from '../features/banks/get-by-id/get-by-id.controller';
import { GetBankByIdService } from '../features/banks/get-by-id/get-by-id.service';

// Update
import { UpdateBankController } from '../features/banks/update/update.controller';
import { UpdateBankService } from '../features/banks/update/update.service';

// Update Status
import { UpdateBankStatusController } from '../features/banks/update-status/update-status.controller';
import { UpdateBankStatusService } from '../features/banks/update-status/update-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bank])],
  controllers: [
    CreateBankController,
    GetAllBanksController,
    GetBankByIdController,
    UpdateBankController,
    UpdateBankStatusController,
  ],
  providers: [
    CreateBankService,
    GetAllBanksService,
    GetBankByIdService,
    UpdateBankService,
    UpdateBankStatusService,
  ],
})
export class BanksModule {}
