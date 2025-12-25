import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Platform } from './entities/platform.entity';
import { PlatformStatus } from './common/enums/platform.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const platformRepository = dataSource.getRepository(Platform);

  const platforms = [
    { name: 'Binance', status: PlatformStatus.ACTIVE },
    { name: 'Bybit', status: PlatformStatus.ACTIVE },
    { name: 'OKX', status: PlatformStatus.ACTIVE },
    { name: 'Huobi', status: PlatformStatus.ACTIVE },
    { name: 'KuCoin', status: PlatformStatus.ACTIVE },
    { name: 'Kraken', status: PlatformStatus.ACTIVE },
    { name: 'Coinbase', status: PlatformStatus.ACTIVE },
  ];

  for (const platform of platforms) {
    const exists = await platformRepository.findOne({ where: { name: platform.name } });
    if (!exists) {
      await platformRepository.save(platformRepository.create(platform));
      console.log(`✅ Created platform: ${platform.name}`);
    } else {
      console.log(`⏭️  Platform already exists: ${platform.name}`);
    }
  }

  console.log('\n🎉 Seed completed!');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
