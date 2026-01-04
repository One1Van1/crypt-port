import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Platform } from './entities/platform.entity';
import { Balance } from './entities/balance.entity';
import { Drop } from './entities/drop.entity';
import { DropNeoBank } from './entities/drop-neo-bank.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Transaction } from './entities/transaction.entity';
import { PesoToUsdtConversion } from './entities/peso-to-usdt-conversion.entity';
import { Profit } from './entities/profit.entity';
import { CashWithdrawal } from './entities/cash-withdrawal.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { Currency } from './common/enums/balance.enum';
import { NeoBankStatus, NeoBankProvider } from './common/enums/neo-bank.enum';
import { DropStatus } from './common/enums/drop.enum';
import { BankAccountStatus } from './common/enums/bank-account.enum';
import { TransactionStatus } from './common/enums/transaction.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting seed for Working Deposit...\n');

  // Repositories
  const platformRepo = dataSource.getRepository(Platform);
  const balanceRepo = dataSource.getRepository(Balance);
  const dropRepo = dataSource.getRepository(Drop);
  const dropNeoBankRepo = dataSource.getRepository(DropNeoBank);
  const bankAccountRepo = dataSource.getRepository(BankAccount);
  const transactionRepo = dataSource.getRepository(Transaction);
  const conversionRepo = dataSource.getRepository(PesoToUsdtConversion);
  const profitRepo = dataSource.getRepository(Profit);
  const cashWithdrawalRepo = dataSource.getRepository(CashWithdrawal);
  const systemSettingRepo = dataSource.getRepository(SystemSetting);

  // 1. Platform Balances - балансы USDT на платформах
  console.log('1️⃣  Creating Platform Balances (USDT)...');
  
  const binance = await platformRepo.findOne({ where: { name: 'Binance' } });
  const bybit = await platformRepo.findOne({ where: { name: 'Bybit' } });

  if (binance) {
    await balanceRepo.save({
      platform: binance,
      currency: Currency.USDT,
      amount: 4666.57,
    });
    console.log('   ✅ Binance: 4666.57 USDT');
  }

  if (bybit) {
    await balanceRepo.save({
      platform: bybit,
      currency: Currency.USDT,
      amount: 4750.00,
    });
    console.log('   ✅ Bybit: 4750.00 USDT');
  }

  console.log('   💰 Total Platform Balances: 9416.57 USDT\n');

  // 2. Blocked Pesos - замороженные нео-банки
  console.log('2️⃣  Creating Blocked Pesos (Frozen Neo-Banks)...');
  
  const drop1 = await dropRepo.save({
    name: 'Drop Test 1',
    status: DropStatus.ACTIVE,
  });

  // Пока оставляем пустым - можно добавить позже
  console.log('   🔒 Blocked Pesos: 0.00 ARS\n');

  // 3. Unpaid Pesos - активные нео-банки + pending транзакции
  console.log('3️⃣  Creating Unpaid Pesos (Active Neo-Banks + Pending Transactions)...');

  // Активные нео-банки
  await dropNeoBankRepo.save({
    provider: NeoBankProvider.RIPIO,
    accountId: 'rplo',
    status: NeoBankStatus.ACTIVE,
    currentBalance: 500000.00,
    drop: drop1,
    platform: binance,
  });
  console.log('   ⏳ Neo-bank (rplo): 500,000 ARS → Binance');

  await dropNeoBankRepo.save({
    provider: NeoBankProvider.LEMON_CASH,
    accountId: 'lemon_cash',
    status: NeoBankStatus.ACTIVE,
    currentBalance: 400000.00,
    drop: drop1,
    platform: binance,
  });
  console.log('   ⏳ Neo-bank (lemon_cash): 400,000 ARS → Binance');

  await dropNeoBankRepo.save({
    provider: NeoBankProvider.SATOSHI_TANGO,
    accountId: 'satoshi_tango',
    status: NeoBankStatus.ACTIVE,
    currentBalance: 500000.00,
    drop: drop1,
    platform: bybit,
  });
  console.log('   ⏳ Neo-bank (satoshi_tango): 500,000 ARS → Bybit');

  await dropNeoBankRepo.save({
    provider: NeoBankProvider.YONT,
    accountId: 'yont',
    status: NeoBankStatus.ACTIVE,
    currentBalance: 400000.00,
    drop: drop1,
    platform: bybit,
  });
  console.log('   ⏳ Neo-bank (yont): 400,000 ARS → Bybit');

  console.log('   💵 Total Unpaid Pesos: 1,800,000 ARS (~1,636 USDT at rate 1100)\n');

  // 4. Free USDT - конвертации минус профит
  console.log('4️⃣  Creating Free USDT (Conversions - Profits)...');
  console.log('   ✨ Free USDT: 0.00 USDT (no conversions yet)\n');

  // 5. Deficit - pending cash withdrawals
  console.log('5️⃣  Creating Deficit (Pending Cash Withdrawals)...');
  console.log('   ⚠️  Deficit: 0.00 USDT (no pending withdrawals)\n');

  // 6. Initial Deposit - настройка базового депозита
  console.log('6️⃣  Setting Initial Deposit...');
  
  const initialDepositSetting = await systemSettingRepo.findOne({
    where: { key: 'initial_deposit' },
  });

  if (initialDepositSetting) {
    initialDepositSetting.value = '9500';
    await systemSettingRepo.save(initialDepositSetting);
  } else {
    await systemSettingRepo.save({
      key: 'initial_deposit',
      value: '9500',
      description: 'Initial working deposit baseline for profit calculation',
    });
  }
  console.log('   📊 Initial Deposit: 9,500 USDT\n');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 WORKING DEPOSIT SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💎 Platform Balances:  9,416.57 USDT');
  console.log('🔒 Blocked Pesos:          0.00 USDT');
  console.log('⏳ Unpaid Pesos:       1,636.36 USDT');
  console.log('✨ Free USDT:              0.00 USDT');
  console.log('⚠️  Deficit:               0.00 USDT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 Total Deposit:     11,052.93 USDT');
  console.log('📊 Initial Deposit:    9,500.00 USDT');
  console.log('📈 Profit:            +1,552.93 USDT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Working Deposit seed completed!\n');
  console.log('💡 Next steps:');
  console.log('   1. Перезагрузи страницу /working-deposit');
  console.log('   2. График истории покажет данные за последние 7/30/90 дней');
  console.log('   3. Круговая диаграмма покажет распределение');
  console.log('   4. Столбчатая диаграмма покажет сравнение секций\n');

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Error seeding working deposit:', error);
  process.exit(1);
});
