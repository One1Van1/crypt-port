import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDropNeoBankFreezeEvents1769000500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "drop_neo_bank_freeze_events" (
        "id" SERIAL PRIMARY KEY,
        "neo_bank_id" integer NOT NULL,
        "performed_by_user_id" integer NOT NULL,
        "action" varchar NOT NULL,
        "frozen_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" timestamp NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_drop_neo_bank_freeze_events_neo_bank_id" 
      ON "drop_neo_bank_freeze_events" ("neo_bank_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "drop_neo_bank_freeze_events"
      ADD CONSTRAINT "fk_drop_neo_bank_freeze_events_neo_bank"
      FOREIGN KEY ("neo_bank_id") REFERENCES "drop_neo_banks"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "drop_neo_bank_freeze_events"
      ADD CONSTRAINT "fk_drop_neo_bank_freeze_events_user"
      FOREIGN KEY ("performed_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "drop_neo_bank_freeze_events"`);
  }
}
