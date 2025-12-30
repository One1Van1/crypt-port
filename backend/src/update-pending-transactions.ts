import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'cryptaport',
  synchronize: false,
  logging: true,
});

async function updatePendingTransactions() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Connected to database');

    console.log('Updating PENDING transactions to COMPLETED...');
    const result = await AppDataSource.query(`
      UPDATE "transactions" 
      SET "status" = 'completed' 
      WHERE "status" = 'pending'
    `);

    console.log(`✓ Updated ${result[1]} transactions from PENDING to COMPLETED`);

    await AppDataSource.destroy();
    console.log('✓ Done! Database connection closed.');
  } catch (error) {
    console.error('Error updating transactions:', error);
    process.exit(1);
  }
}

updatePendingTransactions();
