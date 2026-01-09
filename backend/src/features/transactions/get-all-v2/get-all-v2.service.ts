import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { GetAllTransactionsV2QueryDto } from './get-all-v2.query.dto';
import { GetAllTransactionsV2ResponseDto } from './get-all-v2.response.dto';

@Injectable()
export class GetAllTransactionsV2Service {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: GetAllTransactionsV2QueryDto): Promise<GetAllTransactionsV2ResponseDto> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .withDeleted()
      .leftJoinAndSelect('transaction.shift', 'shift')
      .leftJoinAndSelect('shift.platform', 'platform')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.sourceDropNeoBank', 'sourceDropNeoBank');

    queryBuilder.andWhere('transaction.deletedAt IS NULL');

    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: query.status });
    }

    if (query.userId) {
      queryBuilder.andWhere('user.id = :userId', { userId: query.userId });
    }

    if (query.platformId) {
      queryBuilder.andWhere('platform.id = :platformId', { platformId: query.platformId });
    }

    if (query.bankId) {
      queryBuilder.andWhere('bank.id = :bankId', { bankId: query.bankId });
    }

    if (query.dropNeoBankId) {
      queryBuilder.andWhere('sourceDropNeoBank.id = :dropNeoBankId', { dropNeoBankId: query.dropNeoBankId });
    }

    if (query.search) {
      const trimmed = query.search.trim();
      const maybeId = /^[0-9]+$/.test(trimmed) ? Number(trimmed) : null;

      if (maybeId !== null && Number.isFinite(maybeId)) {
        queryBuilder.andWhere(
          '(transaction.id = :searchId OR LOWER(bank.name) LIKE LOWER(:search) OR LOWER(bankAccount.cbu) LIKE LOWER(:search) OR LOWER(drop.name) LIKE LOWER(:search))',
          { searchId: maybeId, search: `%${trimmed}%` },
        );
      } else {
        queryBuilder.andWhere(
          '(LOWER(bank.name) LIKE LOWER(:search) OR LOWER(bankAccount.cbu) LIKE LOWER(:search) OR LOWER(drop.name) LIKE LOWER(:search))',
          { search: `%${trimmed}%` },
        );
      }
    }

    if (query.minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', { minAmount: query.minAmount });
    }

    if (query.maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', { maxAmount: query.maxAmount });
    }

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate AND transaction.createdAt < :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: query.startDate });
    } else if (query.endDate) {
      queryBuilder.andWhere('transaction.createdAt < :endDate', { endDate: query.endDate });
    }

    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const take = query.limit || 10;
    const skip = ((query.page || 1) - 1) * take;

    const [items, total] = await queryBuilder.take(take).skip(skip).getManyAndCount();

    return new GetAllTransactionsV2ResponseDto(items, total);
  }
}
