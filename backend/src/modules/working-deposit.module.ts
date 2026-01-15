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
import { Debt } from '../entities/debt.entity';
import { DebtOperation } from '../entities/debt-operation.entity';

// Get Sections
import { GetWorkingDepositSectionsController } from '../features/working-deposit/get-sections/get-sections.controller';
import { GetWorkingDepositSectionsService } from '../features/working-deposit/get-sections/get-sections.service';

// Get Sections (Free USDT from ledger)
import { GetWorkingDepositSectionsLedgerController } from '../features/working-deposit/get-sections-ledger/get-sections-ledger.controller';
import { GetWorkingDepositSectionsLedgerService } from '../features/working-deposit/get-sections-ledger/get-sections-ledger.service';

// Get Sections (Free USDT from ledger) v2
import { GetWorkingDepositSectionsLedgerV2Controller } from '../features/working-deposit/get-sections-ledger-v2/get-sections-ledger-v2.controller';
import { GetWorkingDepositSectionsLedgerV2Service } from '../features/working-deposit/get-sections-ledger-v2/get-sections-ledger-v2.service';

// Get Sections (Free USDT from ledger) v3 (with debt)
import { GetWorkingDepositSectionsLedgerV3Controller } from '../features/working-deposit/get-sections-ledger-v3/get-sections-ledger-v3.controller';
import { GetWorkingDepositSectionsLedgerV3Service } from '../features/working-deposit/get-sections-ledger-v3/get-sections-ledger-v3.service';

// Get History
import { GetWorkingDepositHistoryController } from '../features/working-deposit/get-history/get-history.controller';
import { GetWorkingDepositHistoryService } from '../features/working-deposit/get-history/get-history.service';

// Get Profit History
import { GetProfitHistoryController } from '../features/working-deposit/get-profit-history/get-profit-history.controller';
import { GetProfitHistoryService } from '../features/working-deposit/get-profit-history/get-profit-history.service';

// Reserve Profit
import { ReserveProfitController } from '../features/working-deposit/reserve-profit/reserve-profit.controller';
import { ReserveProfitService } from '../features/working-deposit/reserve-profit/reserve-profit.service';

// Reserve Profit v2
import { ReserveProfitV2Controller } from '../features/working-deposit/reserve-profit-v2/reserve-profit-v2.controller';
import { ReserveProfitV2Service } from '../features/working-deposit/reserve-profit-v2/reserve-profit-v2.service';

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
      Debt,
      DebtOperation,
    ]),
  ],
  controllers: [
    GetWorkingDepositSectionsController,
    GetWorkingDepositSectionsLedgerController,
    GetWorkingDepositSectionsLedgerV2Controller,
    GetWorkingDepositSectionsLedgerV3Controller,
    GetWorkingDepositHistoryController,
    GetProfitHistoryController,
    ReserveProfitController,
    ReserveProfitV2Controller,
  ],
  providers: [
    GetWorkingDepositSectionsService,
    GetWorkingDepositSectionsLedgerService,
    GetWorkingDepositSectionsLedgerV2Service,
    GetWorkingDepositSectionsLedgerV3Service,
    GetWorkingDepositHistoryService,
    GetProfitHistoryService,
    ReserveProfitService,
    ReserveProfitV2Service,
  ],
})
export class WorkingDepositModule {}
