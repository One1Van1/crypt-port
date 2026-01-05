import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToPesoToUsdtConversion1736029200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'peso_to_usdt_conversions',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        default: "'pending'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('peso_to_usdt_conversions', 'status');
  }
}
