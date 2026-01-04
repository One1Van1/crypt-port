import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Shift } from '../entities/shift.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { NeoBankWithdrawal } from '../entities/neo-bank-withdrawal.entity';
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

// Get My Transactions (detailed)
import { GetMyTransactionsController as GetMyTransactionsDetailedController } from '../features/transactions/get-my-transactions/get-my-transactions.controller';
import { GetMyTransactionsService as GetMyTransactionsDetailedService } from '../features/transactions/get-my-transactions/get-my-transactions.service';

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
  imports: [TypeOrmModule.forFeature([Transaction, Shift, BankAccount, DropNeoBank, NeoBankWithdrawal, Platform])],
  controllers: [
    CreateTransactionController,
    GetMyTransactionsController,
    GetMyBanksController,
    GetMyTransactionsDetailedController,
    GetAllTransactionsController,
    GetTransactionByIdController,
    UpdateTransactionStatusController,
    GetTransactionsStatsController,
  ],
  providers: [
    CreateTransactionService,
    GetMyTransactionsService,
    GetMyBanksService,
    GetMyTransactionsDetailedService,
    GetAllTransactionsService,
    GetTransactionByIdService,
    UpdateTransactionStatusService,
    GetTransactionsStatsService,
  ],
  exports: [],
})
export class TransactionsModule {}
