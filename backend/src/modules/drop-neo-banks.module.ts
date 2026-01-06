import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Drop } from '../entities/drop.entity';
import { Platform } from '../entities/platform.entity';

// Create
import { CreateDropNeoBankController } from '../features/drop-neo-banks/create/create.controller';
import { CreateDropNeoBankService } from '../features/drop-neo-banks/create/create.service';

// Get All
import { GetAllDropNeoBanksController } from '../features/drop-neo-banks/get-all/get-all.controller';
import { GetAllDropNeoBanksService } from '../features/drop-neo-banks/get-all/get-all.service';

// Update
import { UpdateDropNeoBankController } from '../features/drop-neo-banks/update/update.controller';
import { UpdateDropNeoBankService } from '../features/drop-neo-banks/update/update.service';

// Delete
import { DeleteDropNeoBankController } from '../features/drop-neo-banks/delete/delete.controller';
import { DeleteDropNeoBankService } from '../features/drop-neo-banks/delete/delete.service';

// Update Balance
import { UpdateBalanceController } from '../features/drop-neo-banks/update-balance/update-balance.controller';
import { UpdateBalanceService } from '../features/drop-neo-banks/update-balance/update-balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([DropNeoBank, Drop, Platform])],
  controllers: [
    CreateDropNeoBankController,
    GetAllDropNeoBanksController,
    UpdateDropNeoBankController,
    UpdateBalanceController,
    DeleteDropNeoBankController,
  ],
  providers: [
    CreateDropNeoBankService,
    GetAllDropNeoBanksService,
    UpdateDropNeoBankService,
    UpdateBalanceService,
    DeleteDropNeoBankService,
  ],
  exports: [],
})
export class DropNeoBanksModule {}
