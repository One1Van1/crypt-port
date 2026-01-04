import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { GetOperatorBanksResponseDto, OperatorBankDto } from './get-operator-banks.response.dto';

@Injectable()
export class GetOperatorBanksService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(operatorId: number): Promise<GetOperatorBanksResponseDto> {
    // Получаем все активные банковские счета
    const bankAccounts = await this.bankAccountRepository
      .createQueryBuilder('ba')
      .leftJoinAndSelect('ba.bank', 'bank')
      .leftJoinAndSelect('ba.drop', 'drop')
      .where('ba.status = :status', { status: 'working' })
      .orderBy('ba.priority', 'ASC')
      .addOrderBy('ba.lastUsedAt', 'ASC')
      .getMany();

    // Группируем по банкам
    const banksMap = new Map<number, OperatorBankDto>();

    for (const account of bankAccounts) {
      if (!banksMap.has(account.bank.id)) {
        banksMap.set(account.bank.id, {
          id: account.bank.id,
          name: account.bank.name,
          code: account.bank.code,
          status: account.bank.status,
          accounts: [],
        });
      }

      banksMap.get(account.bank.id).accounts.push({
        id: account.id,
        cbu: account.cbu,
        alias: account.alias,
        status: account.status,
        priority: account.priority,
        initialLimitAmount: Number(account.initialLimitAmount),
        currentLimitAmount: Number(account.currentLimitAmount),
        withdrawnAmount: Number(account.withdrawnAmount),
        lastUsedAt: account.lastUsedAt,
        dropName: account.drop?.name || 'Unknown',
      });
    }

    const banks = Array.from(banksMap.values());

    return new GetOperatorBanksResponseDto(banks);
  }
}
