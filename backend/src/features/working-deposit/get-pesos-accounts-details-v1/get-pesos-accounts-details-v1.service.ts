import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { GetPesosAccountsDetailsV1QueryDto, PesosAccountsDetailsKind } from './get-pesos-accounts-details-v1.query.dto';
import { GetPesosAccountsDetailsV1ResponseDto, PesosAccountDetailsV1ItemDto } from './get-pesos-accounts-details-v1.response.dto';

@Injectable()
export class GetPesosAccountsDetailsV1Service {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: GetPesosAccountsDetailsV1QueryDto): Promise<GetPesosAccountsDetailsV1ResponseDto> {
    if (query.kind === PesosAccountsDetailsKind.BLOCKED) {
      // Business rule: working deposit does not include blocked pesos.
      return new GetPesosAccountsDetailsV1ResponseDto([]);
    }

    const bankAccounts = await this.bankAccountRepository.find({
      order: { id: 'ASC' },
      relations: {
        bank: true,
        drop: true,
      },
    });

    const opRepo = this.transactionRepository.manager.getRepository(BankAccountWithdrawnOperation);

    const items: PesosAccountDetailsV1ItemDto[] = [];

    for (const account of bankAccounts) {
      const amountPesos = Number(account.withdrawnAmount) || 0;
      if (amountPesos <= 0) continue;

      const credits = await opRepo.find({
        where: {
          bankAccountId: account.id,
          type: BankAccountWithdrawnOperationType.CREDIT,
        },
        order: { id: 'ASC' },
      });

      let accountUsdt = 0;

      for (const c of credits) {
        const remaining = Number(c.remainingPesos ?? 0);
        const rate = Number(c.platformRate ?? 0);
        if (!Number.isFinite(remaining) || remaining <= 0) continue;
        if (!Number.isFinite(rate) || rate <= 0) continue;

        accountUsdt += remaining / rate;
      }

      if (!Number.isFinite(accountUsdt)) accountUsdt = 0;

      const identifier = account.cbu ? `${account.alias} - ${account.cbu}` : account.alias;

      items.push(
        new PesosAccountDetailsV1ItemDto({
          id: account.id,
          type: 'bank_account',
          identifier,
          bankName: account.bank?.name ?? '—',
          dropName: account.drop?.name ?? '—',
          balanceUsdt: accountUsdt,
        }),
      );
    }

    return new GetPesosAccountsDetailsV1ResponseDto(items);
  }
}
