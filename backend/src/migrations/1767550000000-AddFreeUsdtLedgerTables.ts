import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddFreeUsdtLedgerTables1767550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'free_usdt_entries',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
          { name: 'conversion_id', type: 'int' },
          { name: 'pesos_amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'exchange_rate', type: 'decimal', precision: 15, scale: 2 },
          { name: 'usdt_amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'converted_by_user_id', type: 'int' },
          { name: 'confirmed_by_user_id', type: 'int' },
          { name: 'confirmed_at', type: 'timestamp' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'free_usdt_entries',
      new TableIndex({
        name: 'IDX_free_usdt_entries_conversion_id_unique',
        columnNames: ['conversion_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKeys('free_usdt_entries', [
      new TableForeignKey({
        columnNames: ['conversion_id'],
        referencedTableName: 'peso_to_usdt_conversions',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['converted_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['confirmed_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'free_usdt_distributions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
          { name: 'platform_id', type: 'int' },
          { name: 'amount_usdt', type: 'decimal', precision: 15, scale: 2 },
          { name: 'distributed_by_user_id', type: 'int' },
          { name: 'comment', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'free_usdt_distributions',
      new TableIndex({
        name: 'IDX_free_usdt_distributions_platform_id',
        columnNames: ['platform_id'],
      }),
    );

    await queryRunner.createIndex(
      'free_usdt_distributions',
      new TableIndex({
        name: 'IDX_free_usdt_distributions_distributed_by_user_id',
        columnNames: ['distributed_by_user_id'],
      }),
    );

    await queryRunner.createForeignKeys('free_usdt_distributions', [
      new TableForeignKey({
        columnNames: ['platform_id'],
        referencedTableName: 'platforms',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['distributed_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('free_usdt_distributions', true);
    await queryRunner.dropTable('free_usdt_entries', true);
  }
}
