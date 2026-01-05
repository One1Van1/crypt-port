import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCommentToPesoToUsdtConversion1736030400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'peso_to_usdt_conversions',
      new TableColumn({
        name: 'comment',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('peso_to_usdt_conversions', 'comment');
  }
}
