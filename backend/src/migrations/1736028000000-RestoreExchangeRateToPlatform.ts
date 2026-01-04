import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestoreExchangeRateToPlatform1736028000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add exchange_rate column back to platforms table
    await queryRunner.query(`
      ALTER TABLE platforms 
      ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 2) DEFAULT 0 NOT NULL
    `);

    // Set default exchange rate for existing platforms
    await queryRunner.query(`
      UPDATE platforms 
      SET exchange_rate = 1100 
      WHERE exchange_rate = 0 OR exchange_rate IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE platforms 
      DROP COLUMN IF EXISTS exchange_rate
    `);
  }
}
