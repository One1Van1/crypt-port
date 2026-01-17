import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminMintReasonToFreeUsdtAdjustments1769100000000
  implements MigrationInterface
{
  name = 'AddAdminMintReasonToFreeUsdtAdjustments1769100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'free_usdt_adjustments_reason_enum') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            WHERE t.typname = 'free_usdt_adjustments_reason_enum'
              AND e.enumlabel = 'ADMIN_MINT'
          ) THEN
            ALTER TYPE "free_usdt_adjustments_reason_enum" ADD VALUE 'ADMIN_MINT';
          END IF;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres does not support removing enum values easily.
  }
}
