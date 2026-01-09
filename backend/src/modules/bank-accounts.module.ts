import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from '../entities/bank-account.entity';
import { Bank } from '../entities/bank.entity';
import { Drop } from '../entities/drop.entity';

// Create
import { CreateBankAccountController } from '../features/bank-accounts/create/create.controller';
import { CreateBankAccountService } from '../features/bank-accounts/create/create.service';

// Get All
import { GetAllBankAccountsController } from '../features/bank-accounts/get-all/get-all.controller';
import { GetAllBankAccountsService } from '../features/bank-accounts/get-all/get-all.service';

// Get By ID
import { GetBankAccountByIdController } from '../features/bank-accounts/get-by-id/get-by-id.controller';
import { GetBankAccountByIdService } from '../features/bank-accounts/get-by-id/get-by-id.service';

// Delete
import { DeleteBankAccountController } from '../features/bank-accounts/delete/delete.controller';
import { DeleteBankAccountService } from '../features/bank-accounts/delete/delete.service';

// Update
import { UpdateBankAccountController } from '../features/bank-accounts/update/update.controller';
import { UpdateBankAccountService } from '../features/bank-accounts/update/update.service';

// Update Status
import { UpdateBankAccountStatusController } from '../features/bank-accounts/update-status/update-status.controller';
import { UpdateBankAccountStatusService } from '../features/bank-accounts/update-status/update-status.service';

// Update Priority
import { UpdateBankAccountPriorityController } from '../features/bank-accounts/update-priority/update-priority.controller';
import { UpdateBankAccountPriorityService } from '../features/bank-accounts/update-priority/update-priority.service';

// Block
import { BlockBankAccountController } from '../features/bank-accounts/block/block.controller';
import { BlockBankAccountService } from '../features/bank-accounts/block/block.service';

// Get Available
import { GetAvailableBankAccountController } from '../features/bank-accounts/get-available/get-available.controller';
import { GetAvailableBankAccountService } from '../features/bank-accounts/get-available/get-available.service';

// Get Requisite V2
import { GetRequisiteV2Controller } from '../features/bank-accounts/get-requisite-v2/get-requisite-v2.controller';
import { GetRequisiteV2Service } from '../features/bank-accounts/get-requisite-v2/get-requisite-v2.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, Bank, Drop])],
  controllers: [
    CreateBankAccountController,
    GetAllBankAccountsController,
    GetAvailableBankAccountController,
    GetRequisiteV2Controller,
    GetBankAccountByIdController,
    UpdateBankAccountController,
    UpdateBankAccountStatusController,
    UpdateBankAccountPriorityController,
    BlockBankAccountController,
    DeleteBankAccountController,
  ],
  providers: [
    CreateBankAccountService,
    GetAllBankAccountsService,
    GetBankAccountByIdService,
    UpdateBankAccountService,
    UpdateBankAccountStatusService,
    UpdateBankAccountPriorityService,
    BlockBankAccountService,
    GetAvailableBankAccountService,
    GetRequisiteV2Service,
    DeleteBankAccountService,
  ],
})
export class BankAccountsModule {}
