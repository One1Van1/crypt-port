import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from '../entities/platform.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { Profit } from '../entities/profit.entity';
import { CashWithdrawal } from '../entities/cash-withdrawal.entity';
import { Drop } from '../entities/drop.entity';
import { UsdtToPesoExchange } from '../entities/usdt-to-peso-exchange.entity';
import { Transaction } from '../entities/transaction.entity';
import { SystemSetting } from '../entities/system-setting.entity';

// Get Sections
import { GetWorkingDepositSectionsController } from '../features/working-deposit/get-sections/get-sections.controller';
import { GetWorkingDepositSectionsService } from '../features/working-deposit/get-sections/get-sections.service';

// Get History
import { GetWorkingDepositHistoryController } from '../features/working-deposit/get-history/get-history.controller';
import { GetWorkingDepositHistoryService } from '../features/working-deposit/get-history/get-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Platform,
      DropNeoBank,
      BankAccount,
      PesoToUsdtConversion,
      Profit,
      CashWithdrawal,
      Drop,
      UsdtToPesoExchange,
      Transaction,
      SystemSetting,
    ]),
  ],
  controllers: [
    GetWorkingDepositSectionsController,
    GetWorkingDepositHistoryController,
  ],
  providers: [
    GetWorkingDepositSectionsService,
    GetWorkingDepositHistoryService,
  ],
})
export class WorkingDepositModule {}
