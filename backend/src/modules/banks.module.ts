import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from '../entities/bank.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { Transaction } from '../entities/transaction.entity';

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

// Delete
import { DeleteBankController } from '../features/banks/delete/delete.controller';
import { DeleteBankService } from '../features/banks/delete/delete.service';

// Get Operator Banks
import { GetOperatorBanksController } from '../features/banks/get-operator-banks/get-operator-banks.controller';
import { GetOperatorBanksService } from '../features/banks/get-operator-banks/get-operator-banks.service';

// Get Bank Transactions For Operator
import { GetBankTransactionsForOperatorController } from '../features/banks/get-bank-transactions-for-operator/get-bank-transactions-for-operator.controller';
import { GetBankTransactionsForOperatorService } from '../features/banks/get-bank-transactions-for-operator/get-bank-transactions-for-operator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bank, BankAccount, Transaction])],
  controllers: [
    CreateBankController,
    GetAllBanksController,
    GetBankByIdController,
    UpdateBankController,
    UpdateBankStatusController,
    DeleteBankController,
    GetOperatorBanksController,
    GetBankTransactionsForOperatorController,
  ],
  providers: [
    CreateBankService,
    GetAllBanksService,
    GetBankByIdService,
    UpdateBankService,
    UpdateBankStatusService,
    DeleteBankService,
    GetOperatorBanksService,
    GetBankTransactionsForOperatorService,
  ],
})
export class BanksModule {}
