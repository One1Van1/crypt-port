import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Platform } from '../entities/platform.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Balance } from '../entities/balance.entity';
import { UsdtToPesoExchange } from '../entities/usdt-to-peso-exchange.entity';
import { SystemSetting } from '../entities/system-setting.entity';

// Admin Controllers
import { UpdateUserRoleController } from '../features/admin/update-user-role/update-user-role.controller';
import { ExchangeUsdtToPesosController } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.controller';
import { SetInitialDepositController } from '../features/admin/settings/set-initial-deposit.controller';

// Admin Services
import { UpdateUserRoleService } from '../features/admin/update-user-role/update-user-role.service';
import { ExchangeUsdtToPesosService } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.service';
import { SetInitialDepositService } from '../features/admin/settings/set-initial-deposit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Platform,
      DropNeoBank,
      Balance,
      UsdtToPesoExchange,
      SystemSetting,
    ]),
  ],
  controllers: [
    UpdateUserRoleController,
    ExchangeUsdtToPesosController,
    SetInitialDepositController,
  ],
  providers: [
    UpdateUserRoleService,
    ExchangeUsdtToPesosService,
    SetInitialDepositService,
  ],
})
export class AdminModule {}
