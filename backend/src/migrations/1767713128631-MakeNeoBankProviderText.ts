import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeNeoBankProviderText1767713128631 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows: Array<{ udt_name: string }> = await queryRunner.query(`
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_name = 'drop_neo_banks'
        AND column_name = 'provider'
      LIMIT 1;
    `);

    const oldType = rows?.[0]?.udt_name;

    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ALTER COLUMN "provider" TYPE character varying
      USING "provider"::text;
    `);

    if (oldType && oldType !== 'varchar' && oldType !== 'text') {
      await queryRunner.query(`DROP TYPE IF EXISTS "${oldType}";`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'drop_neo_banks_provider_enum') THEN
          CREATE TYPE "drop_neo_banks_provider_enum" AS ENUM ('ripio', 'lemon_cash', 'satoshi_tango', 'yont');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      ALTER TABLE "drop_neo_banks"
      ALTER COLUMN "provider" TYPE "drop_neo_banks_provider_enum"
      USING "provider"::text::"drop_neo_banks_provider_enum";
    `);
  }
}
