import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBankAccountReservations1769001100000 implements MigrationInterface {
  name = 'CreateBankAccountReservations1769001100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bank_account_reservations" (
        "id" SERIAL NOT NULL,
        "bank_account_id" integer NOT NULL,
        "reserved_by_user_id" integer,
        "reservation_token" uuid,
        "reserved_at" timestamp NOT NULL DEFAULT now(),
        "expires_at" timestamp NOT NULL,
        "released_at" timestamp,
        CONSTRAINT "PK_bank_account_reservations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_bank_account_reservations_bank_account_id" UNIQUE ("bank_account_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bank_account_reservations_expires_at" 
      ON "bank_account_reservations" ("expires_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bank_account_reservations_reserved_by_user_id" 
      ON "bank_account_reservations" ("reserved_by_user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bank_account_reservations"`);
  }
}
