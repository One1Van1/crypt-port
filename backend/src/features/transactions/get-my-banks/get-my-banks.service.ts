import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { User } from '../../../entities/user.entity';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { GetMyBanksResponseDto, BankItemDto } from './get-my-banks.response.dto';

@Injectable()
export class GetMyBanksService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(operator: User): Promise<GetMyBanksResponseDto> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .where('transaction.operatorId = :operatorId', { operatorId: operator.id })
      .andWhere('bankAccount.bank IS NOT NULL')
      .getMany();

    // Получаем уникальные банки
    const banksMap = new Map<number, string>();
    
    transactions.forEach((transaction) => {
      if (transaction.bankAccount?.bank) {
        const bank = transaction.bankAccount.bank;
        if (!banksMap.has(bank.id)) {
          banksMap.set(bank.id, bank.name);
        }
      }
    });

    const items = Array.from(banksMap.entries()).map(
      ([id, name]) => new BankItemDto(String(id), name)
    );

    return new GetMyBanksResponseDto(items);
  }
}
