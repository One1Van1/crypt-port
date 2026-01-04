import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyBalanceEntity1767547000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Делаем exchange_rate обязательным
    await queryRunner.query(`
      ALTER TABLE "balances" 
      ALTER COLUMN "exchange_rate" SET NOT NULL;
    `);

    // Удаляем колонки type и currency (они больше не нужны)
    await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN IF EXISTS "type";`);
    await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN IF EXISTS "currency";`);
    
    // Удаляем enum типы
    await queryRunner.query(`DROP TYPE IF EXISTS "balances_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "balances_currency_enum";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Создаём enum типы обратно
    await queryRunner.query(`
      CREATE TYPE "balances_type_enum" AS ENUM('start_deposit', 'platform_deposit');
    `);
    await queryRunner.query(`
      CREATE TYPE "balances_currency_enum" AS ENUM('USDT', 'ARS', 'USD');
    `);

    // Добавляем колонки обратно
    await queryRunner.query(`
      ALTER TABLE "balances" 
      ADD COLUMN "type" "balances_type_enum" DEFAULT 'platform_deposit';
    `);
    await queryRunner.query(`
      ALTER TABLE "balances" 
      ADD COLUMN "currency" "balances_currency_enum" DEFAULT 'USDT';
    `);

    // Делаем exchange_rate опциональным
    await queryRunner.query(`
      ALTER TABLE "balances" 
      ALTER COLUMN "exchange_rate" DROP NOT NULL;
    `);
  }
}
