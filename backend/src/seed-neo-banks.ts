import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { DropNeoBank } from './entities/drop-neo-bank.entity';
import { Drop } from './entities/drop.entity';
import { Platform } from './entities/platform.entity';
import { DropStatus } from './common/enums/drop.enum';
import { NeoBankProvider, NeoBankStatus } from './common/enums/neo-bank.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const dropNeoBankRepository = dataSource.getRepository(DropNeoBank);
  const dropRepository = dataSource.getRepository(Drop);
  const platformRepository = dataSource.getRepository(Platform);

  console.log('🚀 Starting seed...\n');

  // Обновляем курсы обмена для платформ
  console.log('📊 Checking platforms (exchange rate is now global)...');
  const platforms = await platformRepository.find();
  
  if (platforms.length === 0) {
    console.log('⚠️  No platforms found. Please run seed-platforms.ts first.');
  } else {
    for (const platform of platforms) {
      // Курс теперь глобальный, устанавливается через /exchange-rates/set
      console.log(`✅ Platform ${platform.name} found (global exchange rate is now used)`);
    }
  }

  console.log('\n💰 Creating neo-bank accounts...');
  
  // Получаем все активные дропы
  const drops = await dropRepository.find({ where: { status: DropStatus.ACTIVE } });

  if (drops.length === 0) {
    console.log('⚠️  No drops found. Please create drops first.');
    await app.close();
    return;
  }

  // Создаем нео-банки для каждого дропа
  const providers = [
    NeoBankProvider.RIPIO,
    NeoBankProvider.LEMON_CASH,
    NeoBankProvider.SATOSHI_TANGO,
    NeoBankProvider.YONT
  ];
  
  for (const drop of drops) {
    console.log(`\n📦 Creating neo-banks for drop: ${drop.name}`);
    
    // Создаем 2-3 нео-банка для каждого дропа
    const numNeoBanks = Math.floor(Math.random() * 2) + 2; // 2 или 3
    
    for (let i = 0; i < numNeoBanks; i++) {
      const provider = providers[i % providers.length];
      
      // Проверяем, не существует ли уже такой нео-банк
      const exists = await dropNeoBankRepository.findOne({
        where: { 
          drop: { id: drop.id },
          provider: provider
        }
      });

      if (!exists) {
        const neoBank = dropNeoBankRepository.create({
          drop: drop,
          provider: provider,
          accountId: `${drop.name.toLowerCase().replace(/\s+/g, '.')}.${provider.split('_')[0]}${Math.floor(Math.random() * 1000)}`,
          status: NeoBankStatus.ACTIVE,
          currentBalance: Math.floor(Math.random() * 500000) + 100000, // 100k - 600k ARS
              alias: `Auto-generated ${provider} account for ${drop.name}`,
        });

        await dropNeoBankRepository.save(neoBank);
        console.log(`  ✅ Created ${provider} account: ${neoBank.accountId} (Balance: ${neoBank.currentBalance.toLocaleString('es-AR')} ARS)`);
      } else {
        console.log(`  ⏭️  ${provider} account already exists for ${drop.name}`);
      }
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log(`\nSummary:`);
  console.log(`- Platforms with exchange rates: ${platforms.length}`);
  console.log(`- Drops processed: ${drops.length}`);
  console.log(`- Neo-banks created/checked: ${drops.length * 2}`);
  
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
