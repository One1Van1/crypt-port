import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDebtTables1769000900000 implements MigrationInterface {
  name = 'CreateDebtTables1769000900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP NULL,
        key VARCHAR(50) NOT NULL DEFAULT 'global',
        amount_usdt DECIMAL(18, 8) NOT NULL DEFAULT 0
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS debts_key_unique ON debts (key);
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE debt_operation_type_enum AS ENUM ('MANUAL_SET', 'REPAYMENT_FROM_UNPAID_PESO_EXCHANGE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS debt_operations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP NULL,
        debt_id INT NOT NULL,
        type debt_operation_type_enum NOT NULL,
        delta_usdt DECIMAL(18, 8) NOT NULL,
        comment TEXT NULL,
        source_conversion_id INT NULL,
        created_by_user_id INT NULL,
        CONSTRAINT debt_operations_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
        CONSTRAINT debt_operations_source_conversion_id_fkey FOREIGN KEY (source_conversion_id) REFERENCES peso_to_usdt_conversions(id) ON DELETE SET NULL,
        CONSTRAINT debt_operations_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Ensure there is always a global row
    await queryRunner.query(`
      INSERT INTO debts (key, amount_usdt)
      SELECT 'global', 0
      WHERE NOT EXISTS (SELECT 1 FROM debts WHERE key = 'global');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS debt_operations;`);
    await queryRunner.query(`DROP TABLE IF EXISTS debts;`);
    await queryRunner.query(`DROP TYPE IF EXISTS debt_operation_type_enum;`);
  }
}
