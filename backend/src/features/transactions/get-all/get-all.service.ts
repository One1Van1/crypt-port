import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { GetAllTransactionsQueryDto } from './get-all.query.dto';
import { GetAllTransactionsResponseDto, TransactionItemDto } from './get-all.response.dto';

@Injectable()
export class GetAllTransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: GetAllTransactionsQueryDto): Promise<GetAllTransactionsResponseDto> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.shift', 'shift')
      .leftJoinAndSelect('shift.platform', 'platform')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.sourceDropNeoBank', 'sourceDropNeoBank');

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: query.status });
    }

    // Фильтр по пользователю (оператору)
    if (query.userId) {
      queryBuilder.andWhere('user.id = :userId', { userId: query.userId });
    }

    // Фильтр по платформе
    if (query.platformId) {
      queryBuilder.andWhere('platform.id = :platformId', { platformId: query.platformId });
    }

    // Фильтр по банку
    if (query.bankId) {
      queryBuilder.andWhere('bank.id = :bankId', { bankId: query.bankId });
    }

    // Фильтр по банку вывода
    if (query.dropNeoBankId) {
      queryBuilder.andWhere('sourceDropNeoBank.id = :dropNeoBankId', { dropNeoBankId: query.dropNeoBankId });
    }

    // Поиск
    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(bank.name) LIKE LOWER(:search) OR LOWER(bankAccount.cbu) LIKE LOWER(:search) OR LOWER(drop.name) LIKE LOWER(:search))',
        { search: `%${query.search}%` }
      );
    }

    // Фильтр по сумме
    if (query.minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', { minAmount: query.minAmount });
    }
    if (query.maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', { maxAmount: query.maxAmount });
    }

    // Фильтр по дате
    if (query.startDate && query.endDate) {
      console.log('Filtering transactions by date:', { startDate: query.startDate, endDate: query.endDate });
      queryBuilder.andWhere('transaction.createdAt >= :startDate AND transaction.createdAt < :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: query.startDate });
    } else if (query.endDate) {
      queryBuilder.andWhere('transaction.createdAt < :endDate', { endDate: query.endDate });
    }

    // Сортировка
    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const [items, total] = await queryBuilder
      .take(query.limit || 10)
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .getManyAndCount();

    console.log(`Found ${total} transactions (returning ${items.length} items)`);
    if (query.startDate && query.endDate) {
      items.forEach(t => {
        console.log(`Transaction ${t.id}: createdAt = ${t.createdAt}`);
      });
    }

    return new GetAllTransactionsResponseDto(
      items.map((t) => new TransactionItemDto(t)),
      total,
    );
  }
}
