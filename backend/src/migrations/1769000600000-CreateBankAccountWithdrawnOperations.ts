import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBankAccountWithdrawnOperations1769000600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bank_account_withdrawn_operations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },

          { name: 'bank_account_id', type: 'int' },
          { name: 'type', type: 'enum', enum: ['CREDIT', 'DEBIT'] },

          { name: 'amount_pesos', type: 'numeric', precision: 15, scale: 2 },
          { name: 'remaining_pesos', type: 'numeric', precision: 15, scale: 2, default: '0' },

          { name: 'platform_rate', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'platform_id', type: 'int', isNullable: true },

          { name: 'source_drop_neo_bank_id', type: 'int', isNullable: true },
          { name: 'transaction_id', type: 'int', isNullable: true },
          { name: 'cash_withdrawal_id', type: 'int', isNullable: true },

          { name: 'created_by_user_id', type: 'int', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'bank_account_withdrawn_operations',
      new TableIndex({
        name: 'IDX_bank_account_withdrawn_operations_bank_account_id_created_at',
        columnNames: ['bank_account_id', 'created_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'bank_account_withdrawn_operations',
      new TableForeignKey({
        columnNames: ['bank_account_id'],
        referencedTableName: 'bank_accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bank_account_withdrawn_operations',
      new TableForeignKey({
        columnNames: ['platform_id'],
        referencedTableName: 'platforms',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'bank_account_withdrawn_operations',
      new TableForeignKey({
        columnNames: ['source_drop_neo_bank_id'],
        referencedTableName: 'drop_neo_banks',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'bank_account_withdrawn_operations',
      new TableForeignKey({
        columnNames: ['transaction_id'],
        referencedTableName: 'transactions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'bank_account_withdrawn_operations',
      new TableForeignKey({
        columnNames: ['cash_withdrawal_id'],
        referencedTableName: 'cash_withdrawals',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'bank_account_withdrawn_operations',
      new TableForeignKey({
        columnNames: ['created_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bank_account_withdrawn_operations');
    await queryRunner.query('DROP TYPE IF EXISTS "bank_account_withdrawn_operations_type_enum"');
  }
}
