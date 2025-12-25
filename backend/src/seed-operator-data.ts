import { DataSource } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { Drop } from './entities/drop.entity';
import { BankAccount } from './entities/bank-account.entity';
import { User } from './entities/user.entity';
import { BankStatus } from './common/enums/bank.enum';
import { DropStatus } from './common/enums/drop.enum';
import { BankAccountStatus } from './common/enums/bank-account.enum';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'crypt_port',
  entities: ['src/entities/*.entity.ts'],
  synchronize: false,
});

async function seedOperatorData() {
  console.log('🌱 Starting seed for operator test data...');

  await dataSource.initialize();
  console.log('✅ Database connected');

  const bankRepository = dataSource.getRepository(Bank);
  const dropRepository = dataSource.getRepository(Drop);
  const bankAccountRepository = dataSource.getRepository(BankAccount);
  const userRepository = dataSource.getRepository(User);

  try {
    // 1. Найти или создать оператора
    let operator = await userRepository.findOne({
      where: { role: 'operator' as any },
    });

    if (!operator) {
      console.log('⚠️  Оператор не найден. Создайте оператора через регистрацию!');
      process.exit(1);
    }

    console.log(`✅ Найден оператор: ${operator.username} (ID: ${operator.id})`);

    // 2. Создать банки
    console.log('\n📦 Создание банков...');
    const banksData = [
      { name: 'Banco Galicia', code: 'GALICIA', country: 'AR' },
      { name: 'Banco Santander', code: 'SANTANDER', country: 'AR' },
      { name: 'Brubank', code: 'BRUBANK', country: 'AR' },
      { name: 'Banco ICBC', code: 'ICBC', country: 'AR' },
      { name: 'Banco Macro', code: 'MACRO', country: 'AR' },
    ];

    const banks: Bank[] = [];
    for (const bankData of banksData) {
      let bank = await bankRepository.findOne({
        where: { code: bankData.code },
      });

      if (!bank) {
        bank = bankRepository.create({
          ...bankData,
          status: BankStatus.ACTIVE,
        });
        await bankRepository.save(bank);
        console.log(`  ✅ Создан банк: ${bank.name}`);
      } else {
        console.log(`  ⏭️  Банк уже существует: ${bank.name}`);
      }
      banks.push(bank);
    }

    // 3. Создать дропы
    console.log('\n👤 Создание дропов...');
    const dropsData = [
      { name: 'Juan Pérez' },
      { name: 'María González' },
      { name: 'Carlos Rodríguez' },
      { name: 'Ana Martínez' },
      { name: 'Luis Fernández' },
      { name: 'Sofia López' },
      { name: 'Diego García' },
      { name: 'Valentina Sánchez' },
    ];

    const drops: Drop[] = [];
    for (const dropData of dropsData) {
      let drop = await dropRepository.findOne({
        where: {
          name: dropData.name,
        },
      });

      if (!drop) {
        drop = dropRepository.create({
          ...dropData,
          status: DropStatus.ACTIVE,
          userId: operator.id,
        });
        await dropRepository.save(drop);
        console.log(`  ✅ Создан дроп: ${drop.name}`);
      } else {
        console.log(`  ⏭️  Дроп уже существует: ${drop.name}`);
      }
      drops.push(drop);
    }

    // 4. Создать банковские счета
    console.log('\n💳 Создание банковских счетов...');
    const accountsData = [
      {
        bank: banks[0], // Galicia
        drop: drops[0],
        cbu: '0070012312345678901234',
        alias: 'crypto.port.gal',
        limitAmount: 300000,
        priority: 10,
      },
      {
        bank: banks[0], // Galicia
        drop: drops[1],
        cbu: '0070012398765432109876',
        alias: 'crypto.port.gal2',
        limitAmount: 250000,
        priority: 9,
      },
      {
        bank: banks[1], // Santander
        drop: drops[2],
        cbu: '0720012311111111111111',
        alias: 'crypto.santander',
        limitAmount: 400000,
        priority: 8,
      },
      {
        bank: banks[2], // Brubank
        drop: drops[3],
        cbu: '1430001712345678901234',
        alias: 'crypto.brubank',
        limitAmount: 200000,
        priority: 7,
      },
      {
        bank: banks[3], // ICBC
        drop: drops[4],
        cbu: '0150012322222222222222',
        alias: 'crypto.icbc.arg',
        limitAmount: 350000,
        priority: 6,
      },
      {
        bank: banks[4], // Macro
        drop: drops[5],
        cbu: '2850012333333333333333',
        alias: 'crypto.macro',
        limitAmount: 280000,
        priority: 5,
      },
      {
        bank: banks[1], // Santander
        drop: drops[6],
        cbu: '0720012344444444444444',
        alias: 'crypto.sant.backup',
        limitAmount: 180000,
        priority: 4,
      },
      {
        bank: banks[2], // Brubank
        drop: drops[7],
        cbu: '1430001755555555555555',
        alias: 'crypto.bru.test',
        limitAmount: 220000,
        priority: 3,
      },
    ];

    let accountsCreated = 0;
    for (const accountData of accountsData) {
      let account = await bankAccountRepository.findOne({
        where: { cbu: accountData.cbu },
      });

      if (!account) {
        // Используем прямой SQL т.к. limit - зарезервированное слово
        await dataSource.query(
          `INSERT INTO bank_accounts (cbu, alias, status, priority, "limitAmount", "withdrawnAmount", "bankId", "dropId")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            accountData.cbu,
            accountData.alias,
            BankAccountStatus.WORKING,
            accountData.priority,
            accountData.limitAmount,
            0,
            accountData.bank.id,
            accountData.drop.id,
          ]
        );
        console.log(`  ✅ Создан счет: ${accountData.bank.name} - ${accountData.alias} (лимит: ARS ${accountData.limitAmount.toLocaleString()})`);
        accountsCreated++;
      } else {
        console.log(`  ⏭️  Счет уже существует: ${accountData.alias}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seed завершен успешно!');
    console.log('='.repeat(60));
    console.log(`\n📊 Статистика:`);
    console.log(`  • Банков: ${banks.length}`);
    console.log(`  • Дропов: ${drops.length}`);
    console.log(`  • Банковских счетов создано: ${accountsCreated}`);
    console.log(`  • Оператор: ${operator.username}`);
    console.log('\n✅ Оператор готов к работе!');
    console.log('\n🧪 Для тестирования:');
    console.log(`  1. Войти под оператором: ${operator.username}`);
    console.log(`  2. Начать смену на любой площадке`);
    console.log(`  3. Нажать "Получить реквизит"`);
    console.log(`  4. Ввести сумму до ${Math.min(...accountsData.map(a => a.limitAmount)).toLocaleString()} ARS`);
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка при создании данных:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

seedOperatorData()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
