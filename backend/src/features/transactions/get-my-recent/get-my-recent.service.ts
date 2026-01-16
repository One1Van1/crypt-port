import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { User } from '../../../entities/user.entity';
import { GetMyRecentTransactionsQueryDto } from './get-my-recent.query.dto';
import { GetMyRecentTransactionsResponseDto, RecentTransactionItemDto } from './get-my-recent.response.dto';

@Injectable()
export class GetMyRecentTransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(user: User, query: GetMyRecentTransactionsQueryDto): Promise<GetMyRecentTransactionsResponseDto> {
    const limit = query.limit ?? 10;

    const qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .withDeleted()
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .where('transaction.userId = :userId', { userId: user.id })
      .andWhere('transaction.deletedAt IS NULL')
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return new GetMyRecentTransactionsResponseDto({
      items: items.map((t) => new RecentTransactionItemDto(t)),
      total,
    });
  }
}
