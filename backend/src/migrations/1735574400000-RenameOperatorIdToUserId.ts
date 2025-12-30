import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameOperatorIdToUserId1735574400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename operator_id to user_id in transactions table
    await queryRunner.query(
      `ALTER TABLE "transactions" RENAME COLUMN "operator_id" TO "user_id"`,
    );

    // Rename operator_id to user_id in shifts table
    await queryRunner.query(
      `ALTER TABLE "shifts" RENAME COLUMN "operator_id" TO "user_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert user_id to operator_id in shifts table
    await queryRunner.query(
      `ALTER TABLE "shifts" RENAME COLUMN "user_id" TO "operator_id"`,
    );

    // Revert user_id to operator_id in transactions table
    await queryRunner.query(
      `ALTER TABLE "transactions" RENAME COLUMN "user_id" TO "operator_id"`,
    );
  }
}
