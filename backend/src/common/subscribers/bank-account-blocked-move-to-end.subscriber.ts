import { EventSubscriber, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankAccountStatus } from '../enums/bank-account.enum';

@EventSubscriber()
export class BankAccountBlockedMoveToEndSubscriber
  implements EntitySubscriberInterface<BankAccount>
{
  listenTo() {
    return BankAccount;
  }

  async beforeUpdate(event: UpdateEvent<BankAccount>): Promise<void> {
    const statusColumnUpdated = (event.updatedColumns ?? []).some(
      (c) => c.propertyName === 'status' || c.databaseName === 'status',
    );

    if (!statusColumnUpdated) return;

    const nextStatus = (event.entity as BankAccount | undefined)?.status;
    if (nextStatus !== BankAccountStatus.BLOCKED) return;

    const targetId =
      (event.entity as BankAccount | undefined)?.id ??
      (event.databaseEntity as BankAccount | undefined)?.id;

    if (typeof targetId !== 'number') return;

    const manager = event.queryRunner?.manager ?? event.manager;

    const row = await manager.query(
      `
      SELECT id, status, priority
      FROM bank_accounts
      WHERE id = $1
        AND deleted_at IS NULL
      LIMIT 1;
      `,
      [targetId],
    );

    const currentStatus: string | undefined = row?.[0]?.status;
    const currentPriorityRaw: unknown = row?.[0]?.priority;
    const currentPriority =
      typeof currentPriorityRaw === 'number'
        ? currentPriorityRaw
        : Number(currentPriorityRaw);

    if (currentStatus === BankAccountStatus.BLOCKED) return;
    if (!Number.isFinite(currentPriority) || currentPriority <= 0) return;

    const maxRow = await manager.query(
      `
      SELECT COALESCE(MAX(priority), 0) AS max_priority
      FROM bank_accounts
      WHERE deleted_at IS NULL;
      `,
    );

    const maxPriorityRaw: unknown = maxRow?.[0]?.max_priority;
    const maxPriority =
      typeof maxPriorityRaw === 'number' ? maxPriorityRaw : Number(maxPriorityRaw);

    if (!Number.isFinite(maxPriority) || maxPriority <= 0) return;
    if (currentPriority >= maxPriority) {
      (event.entity as BankAccount).priority = maxPriority;
      return;
    }

    // Shift priorities down for all accounts after this one.
    await manager.query(
      `
      UPDATE bank_accounts
      SET priority = priority - 1
      WHERE deleted_at IS NULL
        AND priority > $1;
      `,
      [currentPriority],
    );

    // Ensure the blocked account becomes the last one.
    (event.entity as BankAccount).priority = maxPriority;
  }

  async afterUpdate(event: UpdateEvent<BankAccount>): Promise<void> {
    const statusColumnUpdated = (event.updatedColumns ?? []).some(
      (c) => c.propertyName === 'status' || c.databaseName === 'status',
    );

    if (!statusColumnUpdated) return;

    // Safety: if somehow priorities become duplicated due to stale entity writes,
    // normalize to a stable order (priority, created_at).
    // This should be rare after the beforeUpdate adjustment.
    const manager = event.queryRunner?.manager ?? event.manager;
    await manager.query(
      `
      WITH ordered AS (
        SELECT
          id,
          row_number() OVER (ORDER BY priority ASC, created_at ASC) AS new_priority
        FROM bank_accounts
        WHERE deleted_at IS NULL
      ), duplicated AS (
        SELECT 1
        FROM bank_accounts
        WHERE deleted_at IS NULL
        GROUP BY priority
        HAVING COUNT(*) > 1
        LIMIT 1
      )
      UPDATE bank_accounts ba
      SET priority = ordered.new_priority
      FROM ordered
      WHERE EXISTS (SELECT 1 FROM duplicated)
        AND ba.id = ordered.id
        AND ba.priority IS DISTINCT FROM ordered.new_priority;
      `,
    );
  }
}
