import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { User } from '../../../entities/user.entity';
import { GetMyTransactionsQueryDto } from './get-my.query.dto';
import { GetMyTransactionsResponseDto, TransactionItemDto } from './get-my.response.dto';

@Injectable()
export class GetMyTransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: GetMyTransactionsQueryDto, operator: User): Promise<GetMyTransactionsResponseDto> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.shift', 'shift')
      .leftJoinAndSelect('shift.platform', 'platform')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .where('transaction.operatorId = :operatorId', { operatorId: operator.id });

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: query.status });
    }

    // Фильтр по дате
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: query.startDate });
    } else if (query.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: query.endDate });
    }

    // Сортировка
    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const [items, total] = await queryBuilder
      .take(query.limit || 10)
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .getManyAndCount();

    return new GetMyTransactionsResponseDto(
      items.map((t) => new TransactionItemDto(t)),
      total,
    );
  }
}
