import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { GetTransactionsStatsQueryDto } from './stats.query.dto';
import { GetTransactionsStatsResponseDto } from './stats.response.dto';

@Injectable()
export class GetTransactionsStatsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: GetTransactionsStatsQueryDto): Promise<GetTransactionsStatsResponseDto> {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    // Фильтр по пользователю
    if (query.userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId: query.userId });
    }

    // Фильтр по платформе
    if (query.platformId) {
      queryBuilder.andWhere('transaction.platformId = :platformId', { platformId: query.platformId });
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

    const allTransactions = await queryBuilder.getMany();

    // Подсчет статистики
    const total = allTransactions.length;
    const completed = allTransactions.filter((t) => t.status === TransactionStatus.COMPLETED).length;
    const pending = allTransactions.filter((t) => t.status === TransactionStatus.PENDING).length;
    const failed = allTransactions.filter((t) => t.status === TransactionStatus.FAILED).length;

    const totalAmount = allTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const completedAmount = allTransactions
      .filter((t) => t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const pendingAmount = allTransactions
      .filter((t) => t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const avgAmount = total > 0 ? totalAmount / total : 0;
    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return new GetTransactionsStatsResponseDto({
      total,
      completed,
      pending,
      totalAmount,
      completedAmount,
      pendingAmount,
      avgAmount,
      successRate,
      failed,
    });
  }
}
