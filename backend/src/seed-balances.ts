import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { Platform } from './entities/platform.entity';
import { BalanceType, Currency } from './common/enums/balance.enum';
import { PlatformStatus } from './common/enums/platform.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const balanceRepository = dataSource.getRepository(Balance);
  const platformRepository = dataSource.getRepository(Platform);

  console.log('🚀 Starting balance seed...\n');

  // 1. Создаем общий стартовый депозит (если еще нет)
  const existingStartDeposit = await balanceRepository.findOne({
    where: { type: BalanceType.START_DEPOSIT }
  });

  let startDeposit: Balance;
  
  if (existingStartDeposit) {
    console.log(`⏭️  START_DEPOSIT already exists: ${existingStartDeposit.amount} USDT\n`);
    startDeposit = existingStartDeposit;
  } else {
    const initialAmount = 9500; // 9500 USDT общий рабочий депозит
    
    startDeposit = balanceRepository.create({
      platform: null, // НЕ привязан к платформе
      type: BalanceType.START_DEPOSIT,
      currency: Currency.USDT,
      amount: initialAmount,
      description: 'Initial working deposit for distribution',
    });

    await balanceRepository.save(startDeposit);
    console.log(`✅ Created START_DEPOSIT: ${startDeposit.amount.toFixed(2)} USDT\n`);
  }

  // 2. Распределяем на первые 2 платформы для примера (Binance и KuCoin)
  const platforms = await platformRepository.find({ 
    where: { status: PlatformStatus.ACTIVE },
    order: { name: 'ASC' },
    take: 2, // Берем первые 2 платформы
  });

  if (platforms.length === 0) {
    console.log('⚠️  No active platforms found. Please run seed-platforms.ts first.');
    await app.close();
    return;
  }

  console.log(`📊 Distributing to ${platforms.length} platforms:\n`);

  const amountPerPlatform = 4750; // 4750 USDT на каждую платформу (50/50 от 9500)
  let totalDistributed = 0;

  for (const platform of platforms) {
    // Проверяем, не существует ли уже распределенный баланс
    const existingPlatformBalance = await balanceRepository.findOne({
      where: { 
        platform: { id: platform.id },
        type: BalanceType.PLATFORM_DEPOSIT
      }
    });

    if (existingPlatformBalance) {
      console.log(`⏭️  PLATFORM_DEPOSIT already exists for ${platform.name}: ${existingPlatformBalance.amount} USDT`);
      totalDistributed += Number(existingPlatformBalance.amount);
      continue;
    }

    // Создаем распределенный баланс для платформы
    const platformBalance = balanceRepository.create({
      platform: platform,
      type: BalanceType.PLATFORM_DEPOSIT,
      currency: Currency.USDT,
      amount: amountPerPlatform,
      description: `Distributed from START_DEPOSIT to ${platform.name}`,
    });

    await balanceRepository.save(platformBalance);
    totalDistributed += amountPerPlatform;
    console.log(`✅ Created PLATFORM_DEPOSIT for ${platform.name}: ${platformBalance.amount.toFixed(2)} USDT`);
  }

  // 3. Обновляем START_DEPOSIT (вычитаем распределенное)
  if (totalDistributed > 0 && !existingStartDeposit) {
    startDeposit.amount = Number(startDeposit.amount) - totalDistributed;
    await balanceRepository.save(startDeposit);
    console.log(`\n💰 START_DEPOSIT updated: ${startDeposit.amount.toFixed(2)} USDT remaining`);
  }

  console.log('\n🎉 Balance seed completed successfully!');
  console.log(`\nSummary:`);
  console.log(`- START_DEPOSIT: ${startDeposit.amount} USDT`);
  console.log(`- Platforms with balance: ${platforms.length}`);
  console.log(`- Total distributed: ${totalDistributed} USDT`);
  
  const allBalances = await balanceRepository.find({ relations: ['platform'] });
  console.log(`\n📋 All balances:`);
  allBalances.forEach(b => {
    console.log(`   ${b.type}: ${b.platform?.name || 'GENERAL'} - ${b.amount} ${b.currency}`);
  });
  
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
