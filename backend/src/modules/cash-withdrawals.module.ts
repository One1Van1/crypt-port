import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashWithdrawal } from '../entities/cash-withdrawal.entity';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { WithdrawCashController } from '../features/cash-withdrawals/withdraw/withdraw-cash.controller';
import { WithdrawCashService } from '../features/cash-withdrawals/withdraw/withdraw-cash.service';
import { ConvertToUsdtController } from '../features/cash-withdrawals/convert-to-usdt/convert-to-usdt.controller';
import { ConvertToUsdtService } from '../features/cash-withdrawals/convert-to-usdt/convert-to-usdt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashWithdrawal,
      PesoToUsdtConversion,
      ExchangeRate,
      BankAccount,
    ]),
  ],
  controllers: [WithdrawCashController, ConvertToUsdtController],
  providers: [WithdrawCashService, ConvertToUsdtService],
})
export class CashWithdrawalsModule {}
