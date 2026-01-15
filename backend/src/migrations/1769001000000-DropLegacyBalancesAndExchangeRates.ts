import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropLegacyBalancesAndExchangeRates1769001000000 implements MigrationInterface {
  name = 'DropLegacyBalancesAndExchangeRates1769001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Safety: if some data still exists in legacy balances, only backfill platforms.balance when it is NULL.
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances') THEN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'platforms' AND column_name = 'balance'
          ) THEN
            UPDATE platforms p
            SET balance = COALESCE(
              p.balance,
              (SELECT b.amount FROM balances b WHERE b.platform_id = p.id LIMIT 1),
              0
            );
          END IF;
        END IF;
      END $$;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "balances" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "balances_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "balances_currency_enum";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "exchange_rates" CASCADE;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "exchange_rates" (
        "id" SERIAL PRIMARY KEY,
        "rate" decimal(15, 2) NOT NULL,
        "set_by_user_id" integer NOT NULL,
        "is_active" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "fk_exchange_rates_user" FOREIGN KEY ("set_by_user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_exchange_rates_active" ON "exchange_rates"("is_active")
      WHERE "is_active" = true AND "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "balances" (
        "id" SERIAL PRIMARY KEY,
        "platform_id" integer NOT NULL,
        "amount" decimal(15, 2) NOT NULL DEFAULT 0,
        "exchange_rate" decimal(15, 2) NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "fk_balances_platform" FOREIGN KEY ("platform_id")
          REFERENCES "platforms"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_balances_platform" ON "balances"("platform_id");`);
  }
}
