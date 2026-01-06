import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfitReserveAndDeficitTables1769000000000 implements MigrationInterface {
  name = 'AddProfitReserveAndDeficitTables1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "profit_reserves" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "date" date NOT NULL,
        "amount_usdt" numeric(18,8) NOT NULL,
        "working_deposit_usdt" numeric(18,8) NOT NULL,
        "initial_deposit_usdt" numeric(18,8) NOT NULL,
        "created_by_user_id" integer,
        CONSTRAINT "PK_profit_reserves_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_profit_reserves_date" ON "profit_reserves" ("date")
    `);

    await queryRunner.query(`
      ALTER TABLE "profit_reserves"
      ADD CONSTRAINT "FK_profit_reserves_created_by_user"
      FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deficit_records" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "date" date NOT NULL,
        "amount_usdt" numeric(18,8) NOT NULL,
        "working_deposit_usdt" numeric(18,8) NOT NULL,
        "initial_deposit_usdt" numeric(18,8) NOT NULL,
        "created_by_user_id" integer,
        CONSTRAINT "PK_deficit_records_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_deficit_records_date" ON "deficit_records" ("date")
    `);

    await queryRunner.query(`
      ALTER TABLE "deficit_records"
      ADD CONSTRAINT "FK_deficit_records_created_by_user"
      FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'free_usdt_adjustments_reason_enum') THEN
          CREATE TYPE "free_usdt_adjustments_reason_enum" AS ENUM ('RESERVE_PROFIT');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "free_usdt_adjustments" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "reason" "free_usdt_adjustments_reason_enum" NOT NULL,
        "amount_usdt" numeric(18,8) NOT NULL,
        "profit_reserve_id" integer,
        "created_by_user_id" integer,
        CONSTRAINT "PK_free_usdt_adjustments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_free_usdt_adjustments_reason" ON "free_usdt_adjustments" ("reason")
    `);

    await queryRunner.query(`
      ALTER TABLE "free_usdt_adjustments"
      ADD CONSTRAINT "FK_free_usdt_adjustments_profit_reserve"
      FOREIGN KEY ("profit_reserve_id") REFERENCES "profit_reserves"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "free_usdt_adjustments"
      ADD CONSTRAINT "FK_free_usdt_adjustments_created_by_user"
      FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "free_usdt_adjustments" DROP CONSTRAINT IF EXISTS "FK_free_usdt_adjustments_created_by_user"`);
    await queryRunner.query(`ALTER TABLE "free_usdt_adjustments" DROP CONSTRAINT IF EXISTS "FK_free_usdt_adjustments_profit_reserve"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_free_usdt_adjustments_reason"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "free_usdt_adjustments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "free_usdt_adjustments_reason_enum"`);

    await queryRunner.query(`ALTER TABLE "deficit_records" DROP CONSTRAINT IF EXISTS "FK_deficit_records_created_by_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_deficit_records_date"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deficit_records"`);

    await queryRunner.query(`ALTER TABLE "profit_reserves" DROP CONSTRAINT IF EXISTS "FK_profit_reserves_created_by_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_profit_reserves_date"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profit_reserves"`);
  }
}
