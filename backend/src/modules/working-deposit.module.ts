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
import { DailyProfit } from '../entities/daily-profit.entity';
import { FreeUsdtEntry } from '../entities/free-usdt-entry.entity';
import { FreeUsdtDistribution } from '../entities/free-usdt-distribution.entity';
import { ProfitReserve } from '../entities/profit-reserve.entity';
import { DeficitRecord } from '../entities/deficit-record.entity';
import { FreeUsdtAdjustment } from '../entities/free-usdt-adjustment.entity';

// Get Sections
import { GetWorkingDepositSectionsController } from '../features/working-deposit/get-sections/get-sections.controller';
import { GetWorkingDepositSectionsService } from '../features/working-deposit/get-sections/get-sections.service';

// Get Sections (Free USDT from ledger)
import { GetWorkingDepositSectionsLedgerController } from '../features/working-deposit/get-sections-ledger/get-sections-ledger.controller';
import { GetWorkingDepositSectionsLedgerService } from '../features/working-deposit/get-sections-ledger/get-sections-ledger.service';

// Get History
import { GetWorkingDepositHistoryController } from '../features/working-deposit/get-history/get-history.controller';
import { GetWorkingDepositHistoryService } from '../features/working-deposit/get-history/get-history.service';

// Get Profit History
import { GetProfitHistoryController } from '../features/working-deposit/get-profit-history/get-profit-history.controller';
import { GetProfitHistoryService } from '../features/working-deposit/get-profit-history/get-profit-history.service';

// Reserve Profit
import { ReserveProfitController } from '../features/working-deposit/reserve-profit/reserve-profit.controller';
import { ReserveProfitService } from '../features/working-deposit/reserve-profit/reserve-profit.service';

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
      DailyProfit,
      FreeUsdtEntry,
      FreeUsdtDistribution,
      ProfitReserve,
      DeficitRecord,
      FreeUsdtAdjustment,
    ]),
  ],
  controllers: [
    GetWorkingDepositSectionsController,
    GetWorkingDepositSectionsLedgerController,
    GetWorkingDepositHistoryController,
    GetProfitHistoryController,
    ReserveProfitController,
  ],
  providers: [
    GetWorkingDepositSectionsService,
    GetWorkingDepositSectionsLedgerService,
    GetWorkingDepositHistoryService,
    GetProfitHistoryService,
    ReserveProfitService,
  ],
})
export class WorkingDepositModule {}
