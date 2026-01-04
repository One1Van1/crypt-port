import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorBankAccountLimits1736028600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Добавляем новое поле initial_limit_amount
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      ADD COLUMN "initial_limit_amount" NUMERIC(15,2)
    `);

    // 2. Копируем значения из limit_amount в initial_limit_amount
    await queryRunner.query(`
      UPDATE "bank_accounts" 
      SET "initial_limit_amount" = "limit_amount"
    `);

    // 3. Делаем initial_limit_amount NOT NULL
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      ALTER COLUMN "initial_limit_amount" SET NOT NULL
    `);

    // 4. Переименовываем limit_amount в current_limit_amount
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      RENAME COLUMN "limit_amount" TO "current_limit_amount"
    `);

    // 5. Обновляем current_limit_amount = initial_limit_amount - withdrawn_amount
    await queryRunner.query(`
      UPDATE "bank_accounts" 
      SET "current_limit_amount" = "initial_limit_amount" - COALESCE("withdrawn_amount", 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Возвращаем current_limit_amount в limit_amount
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      RENAME COLUMN "current_limit_amount" TO "limit_amount"
    `);

    // 2. Удаляем initial_limit_amount
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      DROP COLUMN "initial_limit_amount"
    `);
  }
}
