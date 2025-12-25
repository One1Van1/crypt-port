import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameLimitToLimitAmount1735156800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Переименовываем колонку limit в limitAmount
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      RENAME COLUMN "limit" TO "limitAmount"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откат: переименовываем обратно
    await queryRunner.query(`
      ALTER TABLE "bank_accounts" 
      RENAME COLUMN "limitAmount" TO "limit"
    `);
  }
}
