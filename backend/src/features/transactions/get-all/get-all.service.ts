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
      .leftJoinAndSelect('transaction.operator', 'operator');

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: query.status });
    }

    // Фильтр по оператору
    if (query.operatorId) {
      queryBuilder.andWhere('transaction.operatorId = :operatorId', { operatorId: query.operatorId });
    }

    // Фильтр по платформе
    if (query.platformId) {
      queryBuilder.andWhere('transaction.platformId = :platformId', { platformId: query.platformId });
    }

    // Фильтр по смене
    if (query.shiftId) {
      queryBuilder.andWhere('transaction.shiftId = :shiftId', { shiftId: query.shiftId });
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

    return new GetAllTransactionsResponseDto(
      items.map((t) => new TransactionItemDto(t)),
      total,
    );
  }
}
