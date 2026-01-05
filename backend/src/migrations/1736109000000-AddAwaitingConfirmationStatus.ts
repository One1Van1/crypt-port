import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAwaitingConfirmationStatus1736109000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Изменяем тип колонки status чтобы поддерживать новый статус (PostgreSQL синтаксис)
    await queryRunner.query(`
      ALTER TABLE cash_withdrawals 
      ALTER COLUMN status TYPE VARCHAR(30),
      ALTER COLUMN status SET DEFAULT 'pending'
    `);
    
    // Обновляем все converted записи на awaiting_confirmation если конвертация pending
    // (это для существующих данных, которые уже были конвертированы но админ еще не подтвердил)
    await queryRunner.query(`
      UPDATE cash_withdrawals cw
      SET status = 'awaiting_confirmation'
      FROM peso_to_usdt_conversions ptuc 
      WHERE ptuc.converted_by_user_id = cw.withdrawn_by_user_id
        AND cw.status = 'converted' 
        AND ptuc.status = 'pending'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откатываем awaiting_confirmation обратно в converted
    await queryRunner.query(`
      UPDATE cash_withdrawals 
      SET status = 'converted' 
      WHERE status = 'awaiting_confirmation'
    `);
  }
}
