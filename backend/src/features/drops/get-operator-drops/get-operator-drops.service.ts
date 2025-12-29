import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drop } from '../../../entities/drop.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { GetOperatorDropsResponseDto, OperatorDropDto } from './get-operator-drops.response.dto';

@Injectable()
export class GetOperatorDropsService {
  constructor(
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(operatorId: number): Promise<GetOperatorDropsResponseDto> {
    // Получаем все дропы, которые есть у активных банковских счетов
    const bankAccounts = await this.bankAccountRepository
      .createQueryBuilder('ba')
      .leftJoinAndSelect('ba.drop', 'drop')
      .leftJoinAndSelect('ba.bank', 'bank')
      .where('ba.status = :status', { status: 'working' })
      .orderBy('ba.priority', 'ASC')
      .getMany();

    // Группируем по дропам
    const dropsMap = new Map<number, OperatorDropDto>();

    for (const account of bankAccounts) {
      if (!account.drop) continue;

      if (!dropsMap.has(account.drop.id)) {
        dropsMap.set(account.drop.id, {
          id: account.drop.id,
          name: account.drop.name,
          comment: account.drop.comment,
          status: account.drop.status,
          accountsCount: 0,
          banks: [],
        });
      }

      const drop = dropsMap.get(account.drop.id);
      drop.accountsCount++;

      // Добавляем банк, если его еще нет
      if (!drop.banks.find((b) => b.id === account.bank.id)) {
        drop.banks.push({
          id: account.bank.id,
          name: account.bank.name,
          code: account.bank.code,
        });
      }
    }

    const drops = Array.from(dropsMap.values());

    return new GetOperatorDropsResponseDto(drops);
  }
}
