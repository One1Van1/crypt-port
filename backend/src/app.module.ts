import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth.module';
import { AdminModule } from './modules/admin.module';
import { BanksModule } from './modules/banks.module';
import { DropsModule } from './modules/drops.module';
import { DropNeoBanksModule } from './modules/drop-neo-banks.module';
import { PlatformsModule } from './modules/platforms.module';
import { BankAccountsModule } from './modules/bank-accounts.module';
import { ShiftsModule } from './modules/shifts.module';
import { TransactionsModule } from './modules/transactions.module';
import { BalancesModule } from './modules/balances.module';
import { UsersModule } from './modules/users.module';
import { AnalyticsModule } from './modules/analytics.module';
import { ExchangeRatesModule } from './modules/exchange-rates.module';
import { CashWithdrawalsModule } from './modules/cash-withdrawals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    AuthModule,
    AdminModule,
    BanksModule,
    DropsModule,
    DropNeoBanksModule,
    PlatformsModule,
    BankAccountsModule,
    ShiftsModule,
    TransactionsModule,
    BalancesModule,
    UsersModule,
    AnalyticsModule,
    ExchangeRatesModule,
    CashWithdrawalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

