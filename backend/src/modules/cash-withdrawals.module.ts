import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashWithdrawal } from '../entities/cash-withdrawal.entity';
import { PesoToUsdtConversion } from '../entities/peso-to-usdt-conversion.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { Shift } from '../entities/shift.entity';
import { Platform } from '../entities/platform.entity';
import { WithdrawCashController } from '../features/cash-withdrawals/withdraw/withdraw-cash.controller';
import { WithdrawCashService } from '../features/cash-withdrawals/withdraw/withdraw-cash.service';
import { ConvertToUsdtController } from '../features/cash-withdrawals/convert-to-usdt/convert-to-usdt.controller';
import { ConvertToUsdtService } from '../features/cash-withdrawals/convert-to-usdt/convert-to-usdt.service';
import { DirectConvertController } from '../features/cash-withdrawals/direct-convert/direct-convert.controller';
import { DirectConvertService } from '../features/cash-withdrawals/direct-convert/direct-convert.service';
import { GetAllConversionsController } from '../features/cash-withdrawals/get-all-conversions/get-all-conversions.controller';
import { GetAllConversionsService } from '../features/cash-withdrawals/get-all-conversions/get-all-conversions.service';
import { ConfirmConversionController } from '../features/cash-withdrawals/confirm-conversion/confirm-conversion.controller';
import { ConfirmConversionService } from '../features/cash-withdrawals/confirm-conversion/confirm-conversion.service';
import { GetAllWithdrawalsController } from '../features/cash-withdrawals/get-all-withdrawals/get-all-withdrawals.controller';
import { GetAllWithdrawalsService } from '../features/cash-withdrawals/get-all-withdrawals/get-all-withdrawals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashWithdrawal,
      PesoToUsdtConversion,
      BankAccount,
      Shift,
      Platform,
    ]),
  ],
  controllers: [
    WithdrawCashController,
    ConvertToUsdtController,
    DirectConvertController,
    GetAllConversionsController,
    ConfirmConversionController,
    GetAllWithdrawalsController,
  ],
  providers: [
    WithdrawCashService,
    ConvertToUsdtService,
    DirectConvertService,
    GetAllConversionsService,
    ConfirmConversionService,
    GetAllWithdrawalsService,
  ],
})
export class CashWithdrawalsModule {}
