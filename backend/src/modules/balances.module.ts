import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from '../entities/balance.entity';
import { Platform } from '../entities/platform.entity';

// Create Balance
import { CreateBalanceController } from '../features/balances/create/create.controller';
import { CreateBalanceService } from '../features/balances/create/create.service';

// Get All Balances
import { GetAllBalancesController } from '../features/balances/get-all/get-all.controller';
import { GetAllBalancesService } from '../features/balances/get-all/get-all.service';

// Get Balances Summary
import { GetBalancesSummaryController } from '../features/balances/summary/summary.controller';
import { GetBalancesSummaryService } from '../features/balances/summary/summary.service';

// Get Balance History
import { GetBalanceHistoryController } from '../features/balances/get-history/get-history.controller';
import { GetBalanceHistoryService } from '../features/balances/get-history/get-history.service';

// Update Balance
import { UpdateBalanceController } from '../features/balances/update/update.controller';
import { UpdateBalanceService } from '../features/balances/update/update.service';

// Adjust Balance
import { AdjustBalanceController } from '../features/balances/adjust/adjust.controller';
import { AdjustBalanceService } from '../features/balances/adjust/adjust.service';

// Delete Balance
import { DeleteBalanceController } from '../features/balances/delete/delete.controller';
import { DeleteBalanceService } from '../features/balances/delete/delete.service';

@Module({
  imports: [TypeOrmModule.forFeature([Balance, Platform])],
  controllers: [
    CreateBalanceController,
    GetAllBalancesController,
    GetBalancesSummaryController,
    GetBalanceHistoryController,
    UpdateBalanceController,
    AdjustBalanceController,
    DeleteBalanceController,
  ],
  providers: [
    CreateBalanceService,
    GetAllBalancesService,
    GetBalancesSummaryService,
    GetBalanceHistoryService,
    UpdateBalanceService,
    AdjustBalanceService,
    DeleteBalanceService,
  ],
  exports: [],
})
export class BalancesModule {}
