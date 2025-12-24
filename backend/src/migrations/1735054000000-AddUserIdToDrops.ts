import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddUserIdToDrops1735054000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем колонку userId
    await queryRunner.addColumn(
      'drops',
      new TableColumn({
        name: 'userId',
        type: 'integer',
        isNullable: true,
      }),
    );

    // Добавляем внешний ключ на таблицу users
    await queryRunner.createForeignKey(
      'drops',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешний ключ
    const table = await queryRunner.getTable('drops');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('userId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('drops', foreignKey);
    }

    // Удаляем колонку
    await queryRunner.dropColumn('drops', 'userId');
  }
}
