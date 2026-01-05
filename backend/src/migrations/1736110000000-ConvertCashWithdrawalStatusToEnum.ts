import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertCashWithdrawalStatusToEnum1736110000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем ENUM тип
    await queryRunner.query(`
      CREATE TYPE cash_withdrawal_status_enum AS ENUM ('pending', 'awaiting_confirmation', 'converted');
    `);

    // Удаляем default перед изменением типа
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Изменяем тип колонки status на ENUM
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status TYPE cash_withdrawal_status_enum 
      USING status::cash_withdrawal_status_enum;
    `);

    // Устанавливаем default значение обратно
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status SET DEFAULT 'pending'::cash_withdrawal_status_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем default
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Возвращаем обратно к VARCHAR
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status TYPE VARCHAR(30) 
      USING status::text;
    `);

    // Устанавливаем default для VARCHAR
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status SET DEFAULT 'pending';
    `);

    // Удаляем ENUM тип
    await queryRunner.query(`
      DROP TYPE cash_withdrawal_status_enum;
    `);
  }
}
