import { MigrationInterface, QueryRunner } from 'typeorm';

type DbTransactionRow = {
  id: number;
  bank_account_id: number;
  amount: string;
  exchange_rate: string | null;
  platform_id: number | null;
  source_drop_neo_bank_id: number | null;
  user_id: number | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};

type DbCashWithdrawalRow = {
  id: number;
  bank_account_id: number;
  amount_pesos: string;
  withdrawal_rate: string;
  withdrawn_by_user_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type DbOperationRow = {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount_pesos: string;
  created_at: string;
};

export class BackfillBankAccountWithdrawnOperations1769000700000 implements MigrationInterface {
  name = 'BackfillBankAccountWithdrawnOperations1769000700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ count: existingCountRaw }] = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM bank_account_withdrawn_operations`,
    );

    const existingCount = Number(existingCountRaw ?? 0);
    if (existingCount > 0) {
      // Idempotency: if already filled, do nothing.
      return;
    }

    const transactions: DbTransactionRow[] = await queryRunner.query(
      `SELECT
        id,
        bank_account_id,
        amount::text,
        exchange_rate::text AS exchange_rate,
        platform_id,
        source_drop_neo_bank_id,
        user_id,
        status,
        created_at::text,
        updated_at::text
      FROM transactions
      WHERE deleted_at IS NULL`,
    );

    for (const tx of transactions) {
      await queryRunner.query(
        `INSERT INTO bank_account_withdrawn_operations (
          created_at,
          updated_at,
          bank_account_id,
          type,
          amount_pesos,
          remaining_pesos,
          platform_rate,
          platform_id,
          source_drop_neo_bank_id,
          transaction_id,
          created_by_user_id
        ) VALUES ($1,$2,$3,'CREDIT',$4,$5,$6,$7,$8,$9,$10)`,
        [
          tx.created_at,
          tx.created_at,
          tx.bank_account_id,
          tx.amount,
          tx.amount,
          tx.exchange_rate,
          tx.platform_id,
          tx.source_drop_neo_bank_id,
          tx.id,
          tx.user_id,
        ],
      );

      if (tx.status === 'failed') {
        await queryRunner.query(
          `INSERT INTO bank_account_withdrawn_operations (
            created_at,
            updated_at,
            bank_account_id,
            type,
            amount_pesos,
            remaining_pesos,
            platform_rate,
            platform_id,
            transaction_id,
            created_by_user_id
          ) VALUES ($1,$2,$3,'DEBIT',$4,'0',$5,$6,$7,$8)`,
          [
            tx.updated_at,
            tx.updated_at,
            tx.bank_account_id,
            tx.amount,
            tx.exchange_rate,
            tx.platform_id,
            tx.id,
            tx.user_id,
          ],
        );
      }
    }

    const withdrawals: DbCashWithdrawalRow[] = await queryRunner.query(
      `SELECT
        id,
        bank_account_id,
        amount_pesos::text,
        withdrawal_rate::text,
        withdrawn_by_user_id,
        status,
        created_at::text,
        updated_at::text
      FROM cash_withdrawals
      WHERE deleted_at IS NULL`,
    );

    for (const wd of withdrawals) {
      let platformId: number | null = null;

      if (wd.withdrawn_by_user_id != null) {
        const shiftRows: Array<{ platform_id: number }> = await queryRunner.query(
          `SELECT platform_id
           FROM shifts
           WHERE deleted_at IS NULL
             AND user_id = $1
             AND start_time <= $2::timestamp
             AND (end_time IS NULL OR end_time >= $2::timestamp)
           ORDER BY start_time DESC
           LIMIT 1`,
          [wd.withdrawn_by_user_id, wd.created_at],
        );
        platformId = shiftRows?.[0]?.platform_id ?? null;
      }

      await queryRunner.query(
        `INSERT INTO bank_account_withdrawn_operations (
          created_at,
          updated_at,
          bank_account_id,
          type,
          amount_pesos,
          remaining_pesos,
          platform_rate,
          platform_id,
          cash_withdrawal_id,
          created_by_user_id
        ) VALUES ($1,$2,$3,'DEBIT',$4,'0',$5,$6,$7,$8)`,
        [
          wd.created_at,
          wd.created_at,
          wd.bank_account_id,
          wd.amount_pesos,
          wd.withdrawal_rate,
          platformId,
          wd.id,
          wd.withdrawn_by_user_id,
        ],
      );
    }

    // Rebuild remaining_pesos using FIFO per bank account
    const bankAccountIds: Array<{ id: number }> = await queryRunner.query(
      `SELECT id FROM bank_accounts WHERE deleted_at IS NULL`,
    );

    for (const { id: bankAccountId } of bankAccountIds) {
      const ops: DbOperationRow[] = await queryRunner.query(
        `SELECT id, type, amount_pesos::text, created_at::text
         FROM bank_account_withdrawn_operations
         WHERE bank_account_id = $1
           AND deleted_at IS NULL
         ORDER BY created_at ASC, id ASC`,
        [bankAccountId],
      );

      // creditRemaining[id] = remainingPesos
      const creditQueue: Array<{ id: number; remaining: number }> = [];
      const creditRemainingUpdates = new Map<number, number>();
      const creditIdsInOrder: number[] = [];

      for (const op of ops) {
        const amount = Number(op.amount_pesos);
        if (!Number.isFinite(amount)) {
          continue;
        }

        if (op.type === 'CREDIT') {
          const rem = amount;
          creditQueue.push({ id: op.id, remaining: rem });
          creditRemainingUpdates.set(op.id, rem);
          creditIdsInOrder.push(op.id);
          continue;
        }

        // DEBIT
        let remainingToConsume = amount;
        while (remainingToConsume > 0 && creditQueue.length > 0) {
          const head = creditQueue[0];
          if (head.remaining <= 0) {
            creditQueue.shift();
            continue;
          }

          const consume = Math.min(head.remaining, remainingToConsume);
          head.remaining -= consume;
          remainingToConsume -= consume;
          creditRemainingUpdates.set(head.id, head.remaining);

          if (head.remaining <= 0) {
            creditQueue.shift();
          }
        }
      }

      const [{ expected_sum: expectedSumRaw }] = await queryRunner.query(
        `SELECT COALESCE(withdrawn_amount, 0)::numeric(15,2)::text AS expected_sum
         FROM bank_accounts
         WHERE id = $1`,
        [bankAccountId],
      );

      const expected = Number(expectedSumRaw ?? 0);
      const computedBeforeAdjust = Array.from(creditRemainingUpdates.values()).reduce((sum, v) => sum + v, 0);

      if (Number.isFinite(expected) && Number.isFinite(computedBeforeAdjust)) {
        const diff = computedBeforeAdjust - expected;

        // If computed remaining exceeds withdrawn_amount, it means history is missing some debit adjustments
        // (e.g., manual corrections). In this case we apply an additional virtual debit to match the
        // source-of-truth: bank_accounts.withdrawn_amount.
        if (diff > 0.01) {
          let excessToConsume = diff;
          for (const creditId of creditIdsInOrder) {
            if (excessToConsume <= 0) break;
            const rem = Number(creditRemainingUpdates.get(creditId) ?? 0);
            if (!Number.isFinite(rem) || rem <= 0) continue;
            const consume = Math.min(rem, excessToConsume);
            creditRemainingUpdates.set(creditId, rem - consume);
            excessToConsume -= consume;
          }
        }

        const computedAfterAdjust = Array.from(creditRemainingUpdates.values()).reduce((sum, v) => sum + v, 0);
        if (computedAfterAdjust + 0.01 < expected) {
          throw new Error(
            `BackfillBankAccountWithdrawnOperations: missing credits for bankAccountId=${bankAccountId}. ` +
              `expected=${expected.toFixed(2)} computed=${computedAfterAdjust.toFixed(2)}`,
          );
        }
      }

      // Persist updates
      for (const [creditId, remaining] of creditRemainingUpdates) {
        await queryRunner.query(
          `UPDATE bank_account_withdrawn_operations
           SET remaining_pesos = $2
           WHERE id = $1`,
          [creditId, remaining.toFixed(2)],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Safe revert: remove only backfilled rows (table was empty before this migration).
    await queryRunner.query(`DELETE FROM bank_account_withdrawn_operations`);
  }
}
