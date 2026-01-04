import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSystemSettings1767501033617 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                key VARCHAR NOT NULL UNIQUE,
                value TEXT NOT NULL,
                description VARCHAR,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                deleted_at TIMESTAMP
            );
        `);

        // Вставляем начальный депозит по умолчанию
        await queryRunner.query(`
            INSERT INTO system_settings (key, value, description)
            VALUES ('initial_deposit', '0', 'Initial working deposit in USDT')
            ON CONFLICT (key) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS system_settings;`);
    }

}
