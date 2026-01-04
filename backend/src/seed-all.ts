import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Загружаем переменные окружения
config({ path: path.join(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crypt_port',
  entities: [path.join(__dirname, 'entities/**/*.entity.{ts,js}')],
  synchronize: false,
});

async function clearAllTables() {
  console.log('🗑️  Clearing all tables (except users)...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Отключаем проверки foreign keys
    await queryRunner.query('SET session_replication_role = replica;');

    // Удаляем данные из всех таблиц кроме users
    const tables = [
      'cash_withdrawals',
      'profits',
      'peso_to_usdt_conversions',
      'usdt_to_peso_exchanges',
      'neo_bank_withdrawals',
      'transactions',
      'drops',
      'drop_neo_banks',
      'bank_accounts',
      'banks',
      'balances',
      'shifts',
      'platforms',
      'system_settings',
    ];

    for (const table of tables) {
      await queryRunner.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
      console.log(`✅ Cleared ${table}`);
    }

    // Включаем обратно проверки foreign keys
    await queryRunner.query('SET session_replication_role = DEFAULT;');

    console.log('✅ All tables cleared successfully\n');
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function seedPlatforms() {
  console.log('🌱 Seeding platforms...');

  const platforms = [
    { name: 'P2P Platform', exchangeRate: 1100 },
    { name: 'Exchange Platform', exchangeRate: 1150 },
    { name: 'Trading Platform', exchangeRate: 1200 },
  ];

  for (const platform of platforms) {
    await AppDataSource.query(
      `INSERT INTO platforms (name, exchange_rate) VALUES ($1, $2)`,
      [platform.name, platform.exchangeRate],
    );
  }

  console.log(`✅ Created ${platforms.length} platforms\n`);
}

async function seedBalances() {
  console.log('🌱 Seeding balances...');

  // Получаем все платформы
  const platforms = await AppDataSource.query('SELECT id FROM platforms ORDER BY id');

  for (const platform of platforms) {
    await AppDataSource.query(
      `INSERT INTO balances (platform_id, amount, currency, type) VALUES ($1, $2, $3, $4)`,
      [platform.id, 10000, 'USDT', 'platform_deposit'],
    );
  }

  console.log(`✅ Created ${platforms.length} balances\n`);
}

async function seedSystemSettings() {
  console.log('🌱 Seeding system settings...');

  await AppDataSource.query(
    `INSERT INTO system_settings (key, value) VALUES ($1, $2)`,
    ['INITIAL_DEPOSIT', '30000'],
  );

  console.log('✅ Created system settings\n');
}

async function seedNeoBanks() {
  console.log('🌱 Seeding neo banks...');

  const platforms = await AppDataSource.query('SELECT id FROM platforms ORDER BY id');
  
  // Создаем drop сначала (требуется для neo-банков)
  await AppDataSource.query(
    `INSERT INTO drops (name, description) VALUES ($1, $2)`,
    ['Test Drop', 'Test drop for seeding'],
  );
  
  const drops = await AppDataSource.query('SELECT id FROM drops ORDER BY id LIMIT 1');
  const dropId = drops[0].id;

  const neoBanks = [
    { provider: 'MERCADO_PAGO', accountId: 'MP1234', currentBalance: 550000, platformId: platforms[0].id, exchangeRate: 1100, usdtEquivalent: 500, dropId },
    { provider: 'UALA', accountId: 'UA5678', currentBalance: 480000, platformId: platforms[0].id, exchangeRate: 1200, usdtEquivalent: 400, dropId },
    { provider: 'NARANJA_X', accountId: 'NX9012', currentBalance: 690000, platformId: platforms[1].id, exchangeRate: 1150, usdtEquivalent: 600, dropId },
    { provider: 'PERSONAL_PAY', accountId: 'PP3456', currentBalance: 345000, platformId: platforms[1].id, exchangeRate: 1150, usdtEquivalent: 300, dropId },
    { provider: 'BRUBANK', accountId: 'BR7890', currentBalance: 360000, platformId: platforms[2].id, exchangeRate: 1200, usdtEquivalent: 300, dropId },
  ];

  for (const neoBank of neoBanks) {
    await AppDataSource.query(
      `INSERT INTO drop_neo_banks (provider, account_id, drop_id, current_balance, status, platform_id, exchange_rate, usdt_equivalent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        neoBank.provider,
        neoBank.accountId,
        neoBank.dropId,
        neoBank.currentBalance,
        'ACTIVE',
        neoBank.platformId,
        neoBank.exchangeRate,
        neoBank.usdtEquivalent,
      ],
    );
  }

  console.log(`✅ Created ${neoBanks.length} neo banks\n`);
}

async function seedBanks() {
  console.log('🌱 Seeding banks...');

  const banks = [
    { name: 'Banco Galicia', code: 'GALICIA' },
    { name: 'Banco Nación', code: 'NACION' },
    { name: 'BBVA', code: 'BBVA' },
    { name: 'Santander', code: 'SANTANDER' },
  ];

  for (const bank of banks) {
    await AppDataSource.query(
      `INSERT INTO banks (name, code) VALUES ($1, $2)`,
      [bank.name, bank.code],
    );
  }

  console.log(`✅ Created ${banks.length} banks\n`);
}

async function seedBankAccounts() {
  console.log('🌱 Seeding bank accounts...');

  const banks = await AppDataSource.query('SELECT id FROM banks ORDER BY id');
  const platforms = await AppDataSource.query('SELECT id FROM platforms ORDER BY id');

  const accounts = [
    { bankId: banks[0].id, platformId: platforms[0].id, alias: 'Galicia P2P', balance: 150000 },
    { bankId: banks[1].id, platformId: platforms[0].id, alias: 'Nación P2P', balance: 200000 },
    { bankId: banks[2].id, platformId: platforms[1].id, alias: 'BBVA Exchange', balance: 180000 },
    { bankId: banks[3].id, platformId: platforms[2].id, alias: 'Santander Trading', balance: 220000 },
  ];

  for (const account of accounts) {
    await AppDataSource.query(
      `INSERT INTO bank_accounts (bank_id, platform_id, alias, account_number, current_balance, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        account.bankId,
        account.platformId,
        account.alias,
        `${Math.floor(100000000 + Math.random() * 900000000)}`,
        account.balance,
        'ACTIVE',
      ],
    );
  }

  console.log(`✅ Created ${accounts.length} bank accounts\n`);
}

async function seedTransactions() {
  console.log('🌱 Seeding transactions (pending)...');

  const bankAccounts = await AppDataSource.query('SELECT id, platform_id FROM bank_accounts ORDER BY id');

  const transactions = [
    { bankAccountId: bankAccounts[0].id, platformId: bankAccounts[0].platform_id, amount: 150000, exchangeRate: 1100 },
    { bankAccountId: bankAccounts[1].id, platformId: bankAccounts[1].platform_id, amount: 200000, exchangeRate: 1100 },
    { bankAccountId: bankAccounts[2].id, platformId: bankAccounts[2].platform_id, amount: 180000, exchangeRate: 1150 },
  ];

  for (const transaction of transactions) {
    const amountUSDT = transaction.amount / transaction.exchangeRate;
    
    await AppDataSource.query(
      `INSERT INTO transactions (bank_account_id, platform_id, amount, amount_usdt, exchange_rate, status, comment) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        transaction.bankAccountId,
        transaction.platformId,
        transaction.amount,
        amountUSDT,
        transaction.exchangeRate,
        'PENDING',
        'Test pending transaction',
      ],
    );
  }

  console.log(`✅ Created ${transactions.length} pending transactions\n`);
}

async function seedUsdtToPesoExchanges() {
  console.log('🌱 Seeding USDT to Peso exchanges...');

  const platforms = await AppDataSource.query('SELECT id FROM platforms ORDER BY id');
  const neoBanks = await AppDataSource.query('SELECT id, platform_id FROM drop_neo_banks ORDER BY id LIMIT 3');

  const exchanges = [
    { platformId: platforms[0].id, neoBankId: neoBanks[0].id, usdtAmount: 500, pesosAmount: 550000, exchangeRate: 1100 },
    { platformId: platforms[0].id, neoBankId: neoBanks[1].id, usdtAmount: 400, pesosAmount: 480000, exchangeRate: 1200 },
    { platformId: platforms[1].id, neoBankId: neoBanks[2].id, usdtAmount: 600, pesosAmount: 690000, exchangeRate: 1150 },
  ];

  for (const exchange of exchanges) {
    await AppDataSource.query(
      `INSERT INTO usdt_to_peso_exchanges (platform_id, drop_neo_bank_id, usdt_amount, pesos_amount, exchange_rate, comment) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        exchange.platformId,
        exchange.neoBankId,
        exchange.usdtAmount,
        exchange.pesosAmount,
        exchange.exchangeRate,
        'Initial deposit to neo-bank',
      ],
    );
  }

  console.log(`✅ Created ${exchanges.length} USDT to Peso exchanges\n`);
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');

    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Шаг 1: Очистка всех таблиц (кроме users)
    await clearAllTables();

    // Шаг 2: Заполнение данными
    await seedPlatforms();
    await seedBalances();
    await seedSystemSettings();
    await seedNeoBanks();
    await seedBanks();
    await seedBankAccounts();
    await seedTransactions();
    await seedUsdtToPesoExchanges();

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
