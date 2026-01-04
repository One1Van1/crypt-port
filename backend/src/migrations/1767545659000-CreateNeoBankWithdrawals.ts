import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNeoBankWithdrawals1767545659000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'neo_bank_withdrawals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'neo_bank_id',
            type: 'uuid',
          },
          {
            name: 'bank_account_id',
            type: 'uuid',
          },
          {
            name: 'transaction_id',
            type: 'uuid',
          },
          {
            name: 'withdrawn_by_user_id',
            type: 'uuid',
          },
          {
            name: 'balance_before',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'balance_after',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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

    // Foreign Keys
    await queryRunner.createForeignKey(
      'neo_bank_withdrawals',
      new TableForeignKey({
        columnNames: ['neo_bank_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drop_neo_banks',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'neo_bank_withdrawals',
      new TableForeignKey({
        columnNames: ['bank_account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bank_accounts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'neo_bank_withdrawals',
      new TableForeignKey({
        columnNames: ['transaction_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'transactions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'neo_bank_withdrawals',
      new TableForeignKey({
        columnNames: ['withdrawn_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('neo_bank_withdrawals');
    
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('neo_bank_withdrawals', fk);
      }
    }
    
    await queryRunner.dropTable('neo_bank_withdrawals');
  }
}
