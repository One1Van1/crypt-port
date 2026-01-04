import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profit } from '../entities/profit.entity';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Balance } from '../entities/balance.entity';

// Withdraw Profit
import { WithdrawProfitController } from '../features/profits/withdraw/withdraw.controller';
import { WithdrawProfitService } from '../features/profits/withdraw/withdraw.service';

// Get Profit History
import { GetProfitHistoryController } from '../features/profits/get-history/get-history.controller';
import { GetProfitHistoryService } from '../features/profits/get-history/get-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profit,
      PesoToUsdtConversion,
      DropNeoBank,
      Balance,
    ]),
  ],
  controllers: [
    WithdrawProfitController,
    GetProfitHistoryController,
  ],
  providers: [
    WithdrawProfitService,
    GetProfitHistoryService,
  ],
})
export class ProfitsModule {}
