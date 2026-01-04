import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorWorkingDepositSystem1736025600000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 0. Включить расширение uuid-ossp
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // 1. Удалить exchange_rate из platforms
        await queryRunner.query(`ALTER TABLE "platforms" DROP COLUMN IF EXISTS "exchange_rate"`);
        
        // 2. Создать таблицу exchange_rates (глобальный курс)
        await queryRunner.query(`
            CREATE TABLE "exchange_rates" (
                "id" SERIAL PRIMARY KEY,
                "rate" decimal(15, 2) NOT NULL,
                "set_by_user_id" integer NOT NULL,
                "is_active" boolean NOT NULL DEFAULT false,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "deleted_at" timestamp,
                CONSTRAINT "fk_exchange_rates_user" FOREIGN KEY ("set_by_user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        
        // Создать индекс для быстрого поиска активного курса
        await queryRunner.query(`
            CREATE INDEX "idx_exchange_rates_active" ON "exchange_rates"("is_active") 
            WHERE "is_active" = true AND "deleted_at" IS NULL
        `);
        
        // 3. Создать таблицу usdt_to_peso_exchanges (админ меняет USDT → песо)
        await queryRunner.query(`
            CREATE TABLE "usdt_to_peso_exchanges" (
                "id" SERIAL PRIMARY KEY,
                "platform_id" integer NOT NULL,
                "neo_bank_id" integer NOT NULL,
                "usdt_amount" decimal(15, 2) NOT NULL,
                "exchange_rate" decimal(15, 2) NOT NULL,
                "pesos_amount" decimal(15, 2) NOT NULL,
                "created_by_user_id" integer NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "deleted_at" timestamp,
                CONSTRAINT "fk_usdt_peso_platform" FOREIGN KEY ("platform_id") 
                    REFERENCES "platforms"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_usdt_peso_neo_bank" FOREIGN KEY ("neo_bank_id") 
                    REFERENCES "drop_neo_banks"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_usdt_peso_user" FOREIGN KEY ("created_by_user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_usdt_peso_platform" ON "usdt_to_peso_exchanges"("platform_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_usdt_peso_neo_bank" ON "usdt_to_peso_exchanges"("neo_bank_id")
        `);
        
        // 4. Создать таблицу peso_to_usdt_conversions (тимлид продаёт песо)
        await queryRunner.query(`
            CREATE TABLE "peso_to_usdt_conversions" (
                "id" SERIAL PRIMARY KEY,
                "pesos_amount" decimal(15, 2) NOT NULL,
                "exchange_rate" decimal(15, 2) NOT NULL,
                "usdt_amount" decimal(15, 2) NOT NULL,
                "converted_by_user_id" integer NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "deleted_at" timestamp,
                CONSTRAINT "fk_peso_usdt_user" FOREIGN KEY ("converted_by_user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_peso_usdt_user" ON "peso_to_usdt_conversions"("converted_by_user_id")
        `);
        
        // 5. Создать таблицу profits
        await queryRunner.query(`
            CREATE TABLE "profits" (
                "id" SERIAL PRIMARY KEY,
                "withdrawn_usdt" decimal(15, 2) NOT NULL,
                "admin_rate" decimal(15, 2) NOT NULL,
                "profit_pesos" decimal(15, 2) NOT NULL,
                "returned_to_section" varchar NOT NULL,
                "returned_amount_pesos" decimal(15, 2) NOT NULL,
                "created_by_user_id" integer NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                "deleted_at" timestamp,
                CONSTRAINT "fk_profits_user" FOREIGN KEY ("created_by_user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "chk_returned_section" CHECK ("returned_to_section" IN ('blocked_pesos', 'unpaid_pesos'))
            )
        `);
        
        await queryRunner.query(`
            CREATE INDEX "idx_profits_user" ON "profits"("created_by_user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Откат в обратном порядке
        await queryRunner.query(`DROP TABLE IF EXISTS "profits"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "peso_to_usdt_conversions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "usdt_to_peso_exchanges"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "exchange_rates"`);
        
        // Вернуть exchange_rate в platforms
        await queryRunner.query(`
            ALTER TABLE "platforms" 
            ADD COLUMN "exchange_rate" decimal(15, 2) DEFAULT 1000.00
        `);
    }
}
