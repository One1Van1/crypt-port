import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Bank } from '../entities/bank.entity';
import { Drop } from '../entities/drop.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { Platform } from '../entities/platform.entity';
import { Shift } from '../entities/shift.entity';
import { Transaction } from '../entities/transaction.entity';

// Get Operators Analytics
import { GetOperatorsAnalyticsController } from '../features/analytics/operators/operators.controller';
import { GetOperatorsAnalyticsService } from '../features/analytics/operators/operators.service';

// Get General Stats
import { GetGeneralStatsController } from '../features/analytics/general/general.controller';
import { GetGeneralStatsService } from '../features/analytics/general/general.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Bank,
      Drop,
      BankAccount,
      Platform,
      Shift,
      Transaction,
    ]),
  ],
  controllers: [GetOperatorsAnalyticsController, GetGeneralStatsController],
  providers: [GetOperatorsAnalyticsService, GetGeneralStatsService],
  exports: [],
})
export class AnalyticsModule {}
