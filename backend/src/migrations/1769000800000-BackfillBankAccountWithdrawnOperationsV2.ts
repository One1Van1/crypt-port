import { MigrationInterface, QueryRunner } from 'typeorm';

type DbOperationRow = {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount_pesos: string;
  created_at: string;
};

export class BackfillBankAccountWithdrawnOperationsV21769000800000 implements MigrationInterface {
  name = 'BackfillBankAccountWithdrawnOperationsV21769000800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Insert missing CREDIT operations for transactions
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
      )
      SELECT
        t.created_at,
        t.created_at,
        t.bank_account_id,
        'CREDIT',
        t.amount,
        t.amount,
        t.exchange_rate,
        t.platform_id,
        t.source_drop_neo_bank_id,
        t.id,
        t.user_id
      FROM transactions t
      WHERE t.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM bank_account_withdrawn_operations o
          WHERE o.deleted_at IS NULL
            AND o.transaction_id = t.id
            AND o.type = 'CREDIT'
        )`,
    );

    // 2) Insert missing DEBIT operations for failed transactions (cancellations)
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
      )
      SELECT
        t.updated_at,
        t.updated_at,
        t.bank_account_id,
        'DEBIT',
        t.amount,
        0,
        t.exchange_rate,
        t.platform_id,
        t.id,
        t.user_id
      FROM transactions t
      WHERE t.deleted_at IS NULL
        AND t.status = 'failed'
        AND NOT EXISTS (
          SELECT 1
          FROM bank_account_withdrawn_operations o
          WHERE o.deleted_at IS NULL
            AND o.transaction_id = t.id
            AND o.type = 'DEBIT'
        )`,
    );

    // 3) Insert missing DEBIT operations for cash withdrawals.
    // We infer platform_id by matching the operator's shift active at withdrawal time.
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
      )
      SELECT
        w.created_at,
        w.created_at,
        w.bank_account_id,
        'DEBIT',
        w.amount_pesos,
        0,
        w.withdrawal_rate,
        s.platform_id,
        w.id,
        w.withdrawn_by_user_id
      FROM cash_withdrawals w
      LEFT JOIN LATERAL (
        SELECT sh.platform_id
        FROM shifts sh
        WHERE sh.deleted_at IS NULL
          AND sh.user_id = w.withdrawn_by_user_id
          AND sh.start_time <= w.created_at
          AND (sh.end_time IS NULL OR sh.end_time >= w.created_at)
        ORDER BY sh.start_time DESC
        LIMIT 1
      ) s ON true
      WHERE w.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM bank_account_withdrawn_operations o
          WHERE o.deleted_at IS NULL
            AND o.cash_withdrawal_id = w.id
            AND o.type = 'DEBIT'
        )`,
    );

    // 4) Rebuild remaining_pesos FIFO per bank account.
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

      const creditQueue: Array<{ id: number; remaining: number }> = [];
      const creditRemainingUpdates = new Map<number, number>();
      const creditIdsInOrder: number[] = [];

      for (const op of ops) {
        const amount = Number(op.amount_pesos);
        if (!Number.isFinite(amount)) continue;

        if (op.type === 'CREDIT') {
          creditQueue.push({ id: op.id, remaining: amount });
          creditRemainingUpdates.set(op.id, amount);
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
            `BackfillBankAccountWithdrawnOperationsV2: missing credits for bankAccountId=${bankAccountId}. ` +
              `expected=${expected.toFixed(2)} computed=${computedAfterAdjust.toFixed(2)}`,
          );
        }
      }

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
    // No safe down: we cannot distinguish historical rows from runtime rows reliably.
    // Keep empty to avoid accidental data loss.
  }
}
