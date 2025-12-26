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

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, Bank, Drop])],
  controllers: [
    CreateBankAccountController,
    GetAllBankAccountsController,
    GetAvailableBankAccountController,
    GetBankAccountByIdController,
    UpdateBankAccountController,
    UpdateBankAccountStatusController,
    UpdateBankAccountPriorityController,
    BlockBankAccountController,
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
  ],
})
export class BankAccountsModule {}
