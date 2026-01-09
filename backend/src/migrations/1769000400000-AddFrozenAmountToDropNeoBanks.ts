import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFrozenAmountToDropNeoBanks1769000400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ADD COLUMN "frozen_amount" decimal(12,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      DROP COLUMN "frozen_amount"
    `);
  }
}
