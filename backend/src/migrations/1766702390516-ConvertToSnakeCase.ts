import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertToSnakeCase1766702390516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // users table
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "twoFactorSecret" TO "two_factor_secret"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "twoFactorEnabled" TO "two_factor_enabled"`);
        
        // drops table
        await queryRunner.query(`ALTER TABLE "drops" RENAME COLUMN "userId" TO "user_id"`);
        
        // bank_accounts table
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "blockReason" TO "block_reason"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "limitAmount" TO "limit_amount"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "withdrawnAmount" TO "withdrawn_amount"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "lastUsedAt" TO "last_used_at"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "bankId" TO "bank_id"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "dropId" TO "drop_id"`);
        
        // transactions table
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "amountUSDT" TO "amount_usdt"`);
        // Добавляем новые колонки для ID если их нет
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "bank_account_id" integer`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "shift_id" integer`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "operator_id" integer`);
        
        // balances table
        await queryRunner.query(`ALTER TABLE "balances" RENAME COLUMN "amountUSDT" TO "amount_usdt"`);
        await queryRunner.query(`ALTER TABLE "balances" RENAME COLUMN "exchangeRate" TO "exchange_rate"`);
        await queryRunner.query(`ALTER TABLE "balances" ADD COLUMN IF NOT EXISTS "platform_id" integer`);
        
        // shifts table
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "startTime" TO "start_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "endTime" TO "end_time"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "totalAmount" TO "total_amount"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "operationsCount" TO "operations_count"`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "operator_id" integer`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "platform_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Откатываем изменения в обратном порядке
        
        // shifts table
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN IF EXISTS "platform_id"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN IF EXISTS "operator_id"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "operations_count" TO "operationsCount"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "total_amount" TO "totalAmount"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "end_time" TO "endTime"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME COLUMN "start_time" TO "startTime"`);
        
        // balances table
        await queryRunner.query(`ALTER TABLE "balances" DROP COLUMN IF EXISTS "platform_id"`);
        await queryRunner.query(`ALTER TABLE "balances" RENAME COLUMN "exchange_rate" TO "exchangeRate"`);
        await queryRunner.query(`ALTER TABLE "balances" RENAME COLUMN "amount_usdt" TO "amountUSDT"`);
        
        // transactions table
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "operator_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "shift_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "bank_account_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "amount_usdt" TO "amountUSDT"`);
        
        // bank_accounts table
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "drop_id" TO "dropId"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "bank_id" TO "bankId"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "last_used_at" TO "lastUsedAt"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "withdrawn_amount" TO "withdrawnAmount"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "limit_amount" TO "limitAmount"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" RENAME COLUMN "block_reason" TO "blockReason"`);
        
        // drops table
        await queryRunner.query(`ALTER TABLE "drops" RENAME COLUMN "user_id" TO "userId"`);
        
        // users table
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "two_factor_enabled" TO "twoFactorEnabled"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "two_factor_secret" TO "twoFactorSecret"`);
    }

}
