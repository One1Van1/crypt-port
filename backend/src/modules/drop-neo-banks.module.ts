import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Drop } from '../entities/drop.entity';
import { Platform } from '../entities/platform.entity';
import { NeoBankWithdrawal } from '../entities/neo-bank-withdrawal.entity';
import { DropNeoBankFreezeEvent } from '../entities/drop-neo-bank-freeze-event.entity';

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

// Get Withdrawals History
import { GetNeoBankWithdrawalsHistoryController } from '../features/drop-neo-banks/get-withdrawals-history/get-withdrawals-history.controller';
import { GetNeoBankWithdrawalsHistoryService } from '../features/drop-neo-banks/get-withdrawals-history/get-withdrawals-history.service';

// Freeze / Unfreeze + History
import { FreezeDropNeoBankController } from '../features/drop-neo-banks/freeze/freeze.controller';
import { FreezeDropNeoBankService } from '../features/drop-neo-banks/freeze/freeze.service';
import { UnfreezeDropNeoBankController } from '../features/drop-neo-banks/unfreeze/unfreeze.controller';
import { UnfreezeDropNeoBankService } from '../features/drop-neo-banks/unfreeze/unfreeze.service';
import { GetDropNeoBankFreezeHistoryController } from '../features/drop-neo-banks/get-freeze-history/get-freeze-history.controller';
import { GetDropNeoBankFreezeHistoryService } from '../features/drop-neo-banks/get-freeze-history/get-freeze-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([DropNeoBank, Drop, Platform, NeoBankWithdrawal, DropNeoBankFreezeEvent])],
  controllers: [
    CreateDropNeoBankController,
    GetAllDropNeoBanksController,
    GetNeoBankLimitsRemainingController,
    GetNeoBankWithdrawalsHistoryController,
    GetDropNeoBankFreezeHistoryController,
    UpdateDropNeoBankController,
    UpdateBalanceController,
    FreezeDropNeoBankController,
    UnfreezeDropNeoBankController,
    DeleteDropNeoBankController,
  ],
  providers: [
    CreateDropNeoBankService,
    GetAllDropNeoBanksService,
    GetNeoBankLimitsRemainingService,
    GetNeoBankWithdrawalsHistoryService,
    GetDropNeoBankFreezeHistoryService,
    UpdateDropNeoBankService,
    UpdateBalanceService,
    FreezeDropNeoBankService,
    UnfreezeDropNeoBankService,
    DeleteDropNeoBankService,
  ],
  exports: [],
})
export class DropNeoBanksModule {}
