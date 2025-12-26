import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Shift } from '../entities/shift.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { Platform } from '../entities/platform.entity';

// Create Transaction
import { CreateTransactionController } from '../features/transactions/create/create.controller';
import { CreateTransactionService } from '../features/transactions/create/create.service';

// Get My Transactions
import { GetMyTransactionsController } from '../features/transactions/get-my/get-my.controller';
import { GetMyTransactionsService } from '../features/transactions/get-my/get-my.service';

// Get My Banks
import { GetMyBanksController } from '../features/transactions/get-my-banks/get-my-banks.controller';
import { GetMyBanksService } from '../features/transactions/get-my-banks/get-my-banks.service';

// Get All Transactions
import { GetAllTransactionsController } from '../features/transactions/get-all/get-all.controller';
import { GetAllTransactionsService } from '../features/transactions/get-all/get-all.service';

// Get Transaction By ID
import { GetTransactionByIdController } from '../features/transactions/get-by-id/get-by-id.controller';
import { GetTransactionByIdService } from '../features/transactions/get-by-id/get-by-id.service';

// Update Transaction Status
import { UpdateTransactionStatusController } from '../features/transactions/update-status/update-status.controller';
import { UpdateTransactionStatusService } from '../features/transactions/update-status/update-status.service';

// Get Transactions Stats
import { GetTransactionsStatsController } from '../features/transactions/stats/stats.controller';
import { GetTransactionsStatsService } from '../features/transactions/stats/stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Shift, BankAccount, Platform])],
  controllers: [
    CreateTransactionController,
    GetMyTransactionsController,
    GetMyBanksController,
    GetAllTransactionsController,
    GetTransactionByIdController,
    UpdateTransactionStatusController,
    GetTransactionsStatsController,
  ],
  providers: [
    CreateTransactionService,
    GetMyTransactionsService,
    GetMyBanksService,
    GetAllTransactionsService,
    GetTransactionByIdService,
    UpdateTransactionStatusService,
    GetTransactionsStatsService,
  ],
  exports: [],
})
export class TransactionsModule {}
