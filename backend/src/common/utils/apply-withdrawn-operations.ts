import { EntityManager } from 'typeorm';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../entities/bank-account-withdrawn-operation.entity';

export const applyWithdrawnDebitFifo = async (params: {
  manager: EntityManager;
  bankAccountId: number;
  amountPesos: number;
}): Promise<void> => {
  const { manager, bankAccountId } = params;
  let remainingToConsume = Number(params.amountPesos);

  if (!Number.isFinite(remainingToConsume) || remainingToConsume <= 0) return;

  const opRepo = manager.getRepository(BankAccountWithdrawnOperation);

  const credits = await opRepo.find({
    where: {
      bankAccountId,
      type: BankAccountWithdrawnOperationType.CREDIT,
    },
    order: { id: 'ASC' },
  });

  for (const credit of credits) {
    const creditRemaining = Number(credit.remainingPesos ?? 0);
    if (!Number.isFinite(creditRemaining) || creditRemaining <= 0) continue;

    const consume = Math.min(creditRemaining, remainingToConsume);
    credit.remainingPesos = String(Number(creditRemaining - consume).toFixed(2));
    await opRepo.save(credit);

    remainingToConsume -= consume;
    if (remainingToConsume <= 0) break;
  }

  // If remainingToConsume > 0, it means the system allowed overdrawing withdrawnAmount.
  // We intentionally do not create negative remaining balances; the source-of-truth remains bank_accounts.withdrawnAmount.
};
