import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Shift } from '../entities/shift.entity';
import { Platform } from '../entities/platform.entity';
import { DropNeoBank } from '../entities/drop-neo-bank.entity';
import { UsdtToPesoExchange } from '../entities/usdt-to-peso-exchange.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { Debt } from '../entities/debt.entity';
import { DebtOperation } from '../entities/debt-operation.entity';

// Admin Controllers
import { UpdateUserRoleController } from '../features/admin/update-user-role/update-user-role.controller';
import { AdminUpdateUserController } from '../features/admin/update-user/update-user.controller';
import { AdminDeleteUserController } from '../features/admin/delete-user/delete-user.controller';
import { AdminEndShiftController } from '../features/admin/end-shift/end-shift.controller';
import { ExchangeUsdtToPesosController } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.controller';
import { SetInitialDepositController } from '../features/admin/settings/set-initial-deposit.controller';
import { GetActiveUsersController } from '../features/admin/get-active-users/get-active-users.controller';
import { GetInactiveUsersController } from '../features/admin/get-inactive-users/get-inactive-users.controller';
import { GetCurrentDebtController } from '../features/admin/debt/get-current/get-current.controller';
import { CreateDebtController } from '../features/admin/debt/create/create.controller';
import { UpdateDebtController } from '../features/admin/debt/update/update.controller';
import { GetDebtOperationsController } from '../features/admin/debt/get-operations/get-operations.controller';
import { IncreaseDebtController } from '../features/admin/debt/increase/increase.controller';
import { DecreaseDebtController } from '../features/admin/debt/decrease/decrease.controller';

// Admin Services
import { UpdateUserRoleService } from '../features/admin/update-user-role/update-user-role.service';
import { AdminUpdateUserService } from '../features/admin/update-user/update-user.service';
import { AdminDeleteUserService } from '../features/admin/delete-user/delete-user.service';
import { AdminEndShiftService } from '../features/admin/end-shift/end-shift.service';
import { ExchangeUsdtToPesosService } from '../features/admin/exchange-usdt-to-pesos/exchange-usdt-to-pesos.service';
import { SetInitialDepositService } from '../features/admin/settings/set-initial-deposit.service';
import { GetActiveUsersService } from '../features/admin/get-active-users/get-active-users.service';
import { GetInactiveUsersService } from '../features/admin/get-inactive-users/get-inactive-users.service';
import { GetCurrentDebtService } from '../features/admin/debt/get-current/get-current.service';
import { CreateDebtService } from '../features/admin/debt/create/create.service';
import { UpdateDebtService } from '../features/admin/debt/update/update.service';
import { GetDebtOperationsService } from '../features/admin/debt/get-operations/get-operations.service';
import { IncreaseDebtService } from '../features/admin/debt/increase/increase.service';
import { DecreaseDebtService } from '../features/admin/debt/decrease/decrease.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Shift,
      Platform,
      DropNeoBank,
      UsdtToPesoExchange,
      SystemSetting,
      Debt,
      DebtOperation,
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
    GetCurrentDebtController,
    CreateDebtController,
    UpdateDebtController,
    GetDebtOperationsController,
    IncreaseDebtController,
    DecreaseDebtController,
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
    GetCurrentDebtService,
    CreateDebtService,
    UpdateDebtService,
    GetDebtOperationsService,
    IncreaseDebtService,
    DecreaseDebtService,
  ],
})
export class AdminModule {}
