import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDropIdRequiredInDropNeoBanks1769000200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM "drop_neo_banks" WHERE "drop_id" IS NULL) THEN
          RAISE EXCEPTION 'Cannot set drop_neo_banks.drop_id NOT NULL: existing rows have NULL drop_id';
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ALTER COLUMN "drop_id" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ALTER COLUMN "drop_id" DROP NOT NULL
    `);
  }
}
