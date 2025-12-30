import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class RemoveUserIdFromDrops1735574500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint first
    const table = await queryRunner.getTable('drops');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('drops', foreignKey);
    }

    // Drop the column
    await queryRunner.dropColumn('drops', 'user_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add the column back
    await queryRunner.query(
      `ALTER TABLE "drops" ADD COLUMN "user_id" integer`,
    );

    // Add foreign key constraint back
    await queryRunner.createForeignKey(
      'drops',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }
}
