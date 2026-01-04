import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCashWithdrawalsTracking1736026800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создать таблицу cash_withdrawals (деньги в пути)
        await queryRunner.query(`
            CREATE TABLE "cash_withdrawals" (
                "id" SERIAL PRIMARY KEY,
                "amount_pesos" decimal(15, 2) NOT NULL,
                "bank_account_id" integer NOT NULL,
                "status" varchar NOT NULL DEFAULT 'pending',
                "withdrawn_by_user_id" integer NOT NULL,
                "comment" text,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "deleted_at" timestamp,
                CONSTRAINT "fk_cash_withdrawal_user" FOREIGN KEY ("withdrawn_by_user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_cash_withdrawal_bank" FOREIGN KEY ("bank_account_id") 
                    REFERENCES "bank_accounts"("id") ON DELETE CASCADE,
                CONSTRAINT "chk_status" CHECK ("status" IN ('pending', 'converted'))
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_cash_withdrawals_status" ON "cash_withdrawals"("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_cash_withdrawals_user" ON "cash_withdrawals"("withdrawn_by_user_id")
        `);

        // Добавить связь в peso_to_usdt_conversions
        await queryRunner.query(`
            ALTER TABLE "peso_to_usdt_conversions" 
            ADD COLUMN IF NOT EXISTS "cash_withdrawal_id" integer
        `);

        await queryRunner.query(`
            ALTER TABLE "peso_to_usdt_conversions"
            ADD CONSTRAINT "fk_peso_usdt_cash_withdrawal" 
            FOREIGN KEY ("cash_withdrawal_id") 
            REFERENCES "cash_withdrawals"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_peso_usdt_cash_withdrawal" ON "peso_to_usdt_conversions"("cash_withdrawal_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "peso_to_usdt_conversions" DROP COLUMN "cash_withdrawal_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cash_withdrawals"`);
    }
}
