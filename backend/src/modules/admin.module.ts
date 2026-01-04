import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Platform } from '../entities/platform.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { Balance } from '../entities/balance.entity';
import { UsdtToPesoExchange } from '../entities/usdt-to-peso-exchange.entity';

// Admin Controllers
import { UpdateUserRoleController } from '../features/admin/update-user-role/update-user-role.controller';
import { ExchangeUsdtToPesosController } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.controller';

// Admin Services
import { UpdateUserRoleService } from '../features/admin/update-user-role/update-user-role.service';
import { ExchangeUsdtToPesosService } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Platform,
      DropNeoBank,
      Balance,
      UsdtToPesoExchange,
    ]),
  ],
  controllers: [
    UpdateUserRoleController,
    ExchangeUsdtToPesosController,
  ],
  providers: [
    UpdateUserRoleService,
    ExchangeUsdtToPesosService,
  ],
})
export class AdminModule {}
