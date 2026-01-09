import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Drop } from '../entities/drop.entity';
import { Platform } from '../entities/platform.entity';
import { NeoBankWithdrawal } from '../entities/neo-bank-withdrawal.entity';

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

// Get Limits Remaining
import { GetNeoBankLimitsRemainingController } from '../features/drop-neo-banks/get-limits-remaining/get-limits-remaining.controller';
import { GetNeoBankLimitsRemainingService } from '../features/drop-neo-banks/get-limits-remaining/get-limits-remaining.service';

@Module({
  imports: [TypeOrmModule.forFeature([DropNeoBank, Drop, Platform, NeoBankWithdrawal])],
  controllers: [
    CreateDropNeoBankController,
    GetAllDropNeoBanksController,
    GetNeoBankLimitsRemainingController,
    UpdateDropNeoBankController,
    UpdateBalanceController,
    DeleteDropNeoBankController,
  ],
  providers: [
    CreateDropNeoBankService,
    GetAllDropNeoBanksService,
    GetNeoBankLimitsRemainingService,
    UpdateDropNeoBankService,
    UpdateBalanceService,
    DeleteDropNeoBankService,
  ],
  exports: [],
})
export class DropNeoBanksModule {}
