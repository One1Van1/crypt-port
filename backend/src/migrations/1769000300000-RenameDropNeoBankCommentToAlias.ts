import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDropNeoBankCommentToAlias1769000300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      RENAME COLUMN "comment" TO "alias"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      RENAME COLUMN "alias" TO "comment"
    `);
  }
}
