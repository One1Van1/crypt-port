import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Shift } from '../entities/shift.entity';
import { Platform } from '../entities/platform.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { UsdtToPesoExchange } from '../entities/usdt-to-peso-exchange.entity';
import { SystemSetting } from '../entities/system-setting.entity';

// Admin Controllers
import { UpdateUserRoleController } from '../features/admin/update-user-role/update-user-role.controller';
import { AdminUpdateUserController } from '../features/admin/update-user/update-user.controller';
import { AdminDeleteUserController } from '../features/admin/delete-user/delete-user.controller';
import { AdminEndShiftController } from '../features/admin/end-shift/end-shift.controller';
import { ExchangeUsdtToPesosController } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.controller';
import { SetInitialDepositController } from '../features/admin/settings/set-initial-deposit.controller';
import { GetActiveUsersController } from '../features/admin/get-active-users/get-active-users.controller';
import { GetInactiveUsersController } from '../features/admin/get-inactive-users/get-inactive-users.controller';

// Admin Services
import { UpdateUserRoleService } from '../features/admin/update-user-role/update-user-role.service';
import { AdminUpdateUserService } from '../features/admin/update-user/update-user.service';
import { AdminDeleteUserService } from '../features/admin/delete-user/delete-user.service';
import { AdminEndShiftService } from '../features/admin/end-shift/end-shift.service';
import { ExchangeUsdtToPesosService } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.service';
import { SetInitialDepositService } from '../features/admin/settings/set-initial-deposit.service';
import { GetActiveUsersService } from '../features/admin/get-active-users/get-active-users.service';
import { GetInactiveUsersService } from '../features/admin/get-inactive-users/get-inactive-users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Shift,
      Platform,
      DropNeoBank,
      UsdtToPesoExchange,
      SystemSetting,
    ]),
  ],
  controllers: [
    UpdateUserRoleController,
    AdminUpdateUserController,
    AdminDeleteUserController,
    AdminEndShiftController,
    GetActiveUsersController,
    GetInactiveUsersController,
    ExchangeUsdtToPesosController,
    SetInitialDepositController,
  ],
  providers: [
    UpdateUserRoleService,
    AdminUpdateUserService,
    AdminDeleteUserService,
    AdminEndShiftService,
    GetActiveUsersService,
    GetInactiveUsersService,
    ExchangeUsdtToPesosService,
    SetInitialDepositService,
  ],
})
export class AdminModule {}
