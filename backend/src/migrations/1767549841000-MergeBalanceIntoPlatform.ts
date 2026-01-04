import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeBalanceIntoPlatform1767548000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле balance в platforms
    await queryRunner.query(`
      ALTER TABLE "platforms" 
      ADD COLUMN "balance" DECIMAL(15,2) DEFAULT 0;
    `);

    // Переносим данные из balances в platforms
    await queryRunner.query(`
      UPDATE "platforms" p
      SET balance = COALESCE(
        (SELECT b.amount FROM "balances" b WHERE b.platform_id = p.id LIMIT 1),
        0
      );
    `);

    // Удаляем таблицу balances
    await queryRunner.query(`DROP TABLE IF EXISTS "balances" CASCADE;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Создаём таблицу balances обратно
    await queryRunner.query(`
      CREATE TABLE "balances" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        "amount" DECIMAL(15,2) DEFAULT 0,
        "amount_usdt" DECIMAL(15,4),
        "exchange_rate" DECIMAL(10,4) NOT NULL,
        "description" VARCHAR,
        "platform_id" INT
      );
    `);

    // Переносим данные обратно
    await queryRunner.query(`
      INSERT INTO "balances" (platform_id, amount, exchange_rate)
      SELECT id, balance, exchange_rate FROM "platforms";
    `);

    // Удаляем поле balance из platforms
    await queryRunner.query(`
      ALTER TABLE "platforms" DROP COLUMN "balance";
    `);
  }
}
