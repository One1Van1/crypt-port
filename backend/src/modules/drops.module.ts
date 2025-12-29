import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drop } from '../entities/drop.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { Transaction } from '../entities/transaction.entity';

// Create
import { CreateDropController } from '../features/drops/create/create.controller';
import { CreateDropService } from '../features/drops/create/create.service';

// Get All
import { GetAllDropsController } from '../features/drops/get-all/get-all.controller';
import { GetAllDropsService } from '../features/drops/get-all/get-all.service';

// Get By ID
import { GetDropByIdController } from '../features/drops/get-by-id/get-by-id.controller';
import { GetDropByIdService } from '../features/drops/get-by-id/get-by-id.service';

// Update
import { UpdateDropController } from '../features/drops/update/update.controller';
import { UpdateDropService } from '../features/drops/update/update.service';

// Update Status
import { UpdateDropStatusController } from '../features/drops/update-status/update-status.controller';
import { UpdateDropStatusService } from '../features/drops/update-status/update-status.service';

// Get Operator Drops
import { GetOperatorDropsController } from '../features/drops/get-operator-drops/get-operator-drops.controller';
import { GetOperatorDropsService } from '../features/drops/get-operator-drops/get-operator-drops.service';

// Get Drop Transactions For Operator
import { GetDropTransactionsForOperatorController } from '../features/drops/get-drop-transactions-for-operator/get-drop-transactions-for-operator.controller';
import { GetDropTransactionsForOperatorService } from '../features/drops/get-drop-transactions-for-operator/get-drop-transactions-for-operator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Drop, BankAccount, Transaction])],
  controllers: [
    CreateDropController,
    GetAllDropsController,
    GetDropByIdController,
    UpdateDropController,
    UpdateDropStatusController,
    GetOperatorDropsController,
    GetDropTransactionsForOperatorController,
  ],
  providers: [
    CreateDropService,
    GetAllDropsService,
    GetDropByIdService,
    UpdateDropService,
    UpdateDropStatusService,
    GetOperatorDropsService,
    GetDropTransactionsForOperatorService,
  ],
})
export class DropsModule {}
