import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDailyAndMonthlyLimitToDropNeoBanks1769000100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ADD COLUMN "daily_limit" numeric(12, 2)
    `);

    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ADD COLUMN "monthly_limit" numeric(12, 2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      DROP COLUMN "monthly_limit"
    `);

    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      DROP COLUMN "daily_limit"
    `);
  }
}
