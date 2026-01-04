import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRateToDropNeoBank1767546000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'drop_neo_banks',
      new TableColumn({
        name: 'exchange_rate',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'drop_neo_banks',
      new TableColumn({
        name: 'usdt_equivalent',
        type: 'decimal',
        precision: 15,
        scale: 4,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('drop_neo_banks', 'usdt_equivalent');
    await queryRunner.dropColumn('drop_neo_banks', 'exchange_rate');
  }
}
