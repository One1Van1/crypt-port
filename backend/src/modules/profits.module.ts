import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profit } from '../entities/profit.entity';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Platform } from '../entities/platform.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { FreeUsdtEntry } from '../entities/free-usdt-entry.entity';
import { FreeUsdtDistribution } from '../entities/free-usdt-distribution.entity';

// Withdraw Profit
import { WithdrawProfitController } from '../features/profits/withdraw/withdraw.controller';
import { WithdrawProfitService } from '../features/profits/withdraw/withdraw.service';

// Get Profit History
import { GetProfitHistoryController } from '../features/profits/get-history/get-history.controller';
import { GetProfitHistoryService } from '../features/profits/get-history/get-history.service';

// Withdraw Profit (simple)
import { WithdrawSimpleProfitController } from '../features/profits/withdraw-simple/withdraw-simple.controller';
import { WithdrawSimpleProfitService } from '../features/profits/withdraw-simple/withdraw-simple.service';

// Withdraw Profit (simple, confirmed conversions only)
import { WithdrawSimpleConfirmedProfitController } from '../features/profits/withdraw-simple-confirmed/withdraw-simple-confirmed.controller';
import { WithdrawSimpleConfirmedProfitService } from '../features/profits/withdraw-simple-confirmed/withdraw-simple-confirmed.service';

// Withdraw Profit (simple, from Free USDT ledger)
import { WithdrawSimpleLedgerProfitController } from '../features/profits/withdraw-simple-ledger/withdraw-simple-ledger.controller';
import { WithdrawSimpleLedgerProfitService } from '../features/profits/withdraw-simple-ledger/withdraw-simple-ledger.service';

// Withdraw Profit (simple, from Free USDT ledger, rounding-safe v2)
import { WithdrawSimpleLedgerV2ProfitController } from '../features/profits/withdraw-simple-ledger-v2/withdraw-simple-ledger-v2.controller';
import { WithdrawSimpleLedgerV2ProfitService } from '../features/profits/withdraw-simple-ledger-v2/withdraw-simple-ledger-v2.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profit,
      PesoToUsdtConversion,
      DropNeoBank,
      Platform,
      SystemSetting,
      FreeUsdtEntry,
      FreeUsdtDistribution,
    ]),
  ],
  controllers: [
    WithdrawProfitController,
    GetProfitHistoryController,
    WithdrawSimpleProfitController,
    WithdrawSimpleConfirmedProfitController,
    WithdrawSimpleLedgerProfitController,
    WithdrawSimpleLedgerV2ProfitController,
  ],
  providers: [
    WithdrawProfitService,
    GetProfitHistoryService,
    WithdrawSimpleProfitService,
    WithdrawSimpleConfirmedProfitService,
    WithdrawSimpleLedgerProfitService,
    WithdrawSimpleLedgerV2ProfitService,
  ],
})
export class ProfitsModule {}
