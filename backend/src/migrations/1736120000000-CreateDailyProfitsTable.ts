import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDailyProfitsTable1736120000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'daily_profits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'date',
            type: 'date',
            isUnique: true,
          },
          {
            name: 'total_usdt',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'initial_deposit',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'profit',
            type: 'decimal',
            precision: 18,
            scale: 8,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'daily_profits',
      new TableIndex({
        name: 'IDX_daily_profits_date',
        columnNames: ['date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('daily_profits');
  }
}
