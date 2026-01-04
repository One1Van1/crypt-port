import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWithdrawalRateToCashWithdrawals1736027200000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cash_withdrawals" 
            ADD COLUMN "withdrawal_rate" decimal(15, 2) NOT NULL DEFAULT 1000.00
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cash_withdrawals" 
            DROP COLUMN "withdrawal_rate"
        `);
    }
}
