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

// Get Requisite V3
import { GetRequisiteV3Controller } from '../features/bank-accounts/get-requisite-v3/get-requisite-v3.controller';
import { GetRequisiteV3Service } from '../features/bank-accounts/get-requisite-v3/get-requisite-v3.service';

// Search Neo-Banks V3
import { SearchNeoBanksV3Controller } from '../features/bank-accounts/search-neo-banks-v3/search-neo-banks-v3.controller';
import { SearchNeoBanksV3Service } from '../features/bank-accounts/search-neo-banks-v3/search-neo-banks-v3.service';

// Reserve/Release Requisite V3
import { ReserveRequisiteV3Controller } from '../features/bank-accounts/reserve-requisite-v3/reserve-requisite-v3.controller';
import { ReserveRequisiteV3Service } from '../features/bank-accounts/reserve-requisite-v3/reserve-requisite-v3.service';
import { ReleaseRequisiteV3Controller } from '../features/bank-accounts/release-requisite-v3/release-requisite-v3.controller';
import { ReleaseRequisiteV3Service } from '../features/bank-accounts/release-requisite-v3/release-requisite-v3.service';

// Get Reservation Status V3
import { GetReservationStatusV3Controller } from '../features/bank-accounts/get-reservation-status-v3/get-reservation-status-v3.controller';
import { GetReservationStatusV3Service } from '../features/bank-accounts/get-reservation-status-v3/get-reservation-status-v3.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, Bank, Drop])],
  controllers: [
    CreateBankAccountController,
    GetAllBankAccountsController,
    GetAvailableBankAccountController,
    GetRequisiteV2Controller,
    GetRequisiteV3Controller,
    ReserveRequisiteV3Controller,
    ReleaseRequisiteV3Controller,
    GetReservationStatusV3Controller,
    SearchNeoBanksV3Controller,
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
    GetRequisiteV3Service,
    ReserveRequisiteV3Service,
    ReleaseRequisiteV3Service,
    GetReservationStatusV3Service,
    SearchNeoBanksV3Service,
    DeleteBankAccountService,
  ],
})
export class BankAccountsModule {}
