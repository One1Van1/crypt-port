import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddPlatformToDropNeoBank1767543595000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add platform_id column
    await queryRunner.addColumn(
      'drop_neo_banks',
      new TableColumn({
        name: 'platform_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'drop_neo_banks',
      new TableForeignKey({
        columnNames: ['platform_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'platforms',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('drop_neo_banks');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('platform_id') !== -1);
    
    if (foreignKey) {
      await queryRunner.dropForeignKey('drop_neo_banks', foreignKey);
    }
    
    await queryRunner.dropColumn('drop_neo_banks', 'platform_id');
  }
}
