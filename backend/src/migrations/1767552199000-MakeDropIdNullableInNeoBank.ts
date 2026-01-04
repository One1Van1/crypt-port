import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDropIdNullableInNeoBank1767549000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks" 
      ALTER COLUMN "drop_id" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks" 
      ALTER COLUMN "drop_id" SET NOT NULL;
    `);
  }
}
