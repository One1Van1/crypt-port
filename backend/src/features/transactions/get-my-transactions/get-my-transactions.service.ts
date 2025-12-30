import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { User } from '../../../entities/user.entity';
import { GetMyTransactionsQueryDto } from './get-my-transactions.query.dto';
import { GetMyTransactionsResponseDto, TransactionItemDto } from './get-my-transactions.response.dto';

@Injectable()
export class GetMyTransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(user: User, query: GetMyTransactionsQueryDto): Promise<GetMyTransactionsResponseDto> {
    console.log('🔍 GetMyTransactionsService.execute called');
    console.log('👤 User:', { id: user.id, username: user.username, role: user.role });

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.shift', 'shift')
      .leftJoinAndSelect('shift.platform', 'platform')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .leftJoinAndSelect('transaction.user', 'user')
      .where('transaction.userId = :userId', { userId: user.id });

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: query.status });
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

    console.log('📝 SQL:', queryBuilder.getSql());
    console.log('📊 Parameters:', queryBuilder.getParameters());

    const [items, total] = await queryBuilder.getManyAndCount();

    console.log('✅ Found items:', items.length, 'Total:', total);

    const transactionItems = items.map((transaction) => {
      const item = new TransactionItemDto();
      item.id = String(transaction.id);
      item.amount = transaction.amount;
      item.currency = 'ARS'; // Default currency
      item.status = transaction.status;
      item.userId = String(transaction.userId);
      item.username = transaction.user?.username || null;
      item.platformId = transaction.shift?.platform?.id || null;
      item.platformName = transaction.shift?.platform?.name || null;
      item.shiftId = String(transaction.shiftId);
      item.bankAccountId = String(transaction.bankAccountId);
      item.bankAccountNumber = transaction.bankAccount?.cbu || null;
      item.bankName = transaction.bankAccount?.bank?.name || null;
      item.dropName = transaction.bankAccount?.drop?.name || null;
      item.createdAt = transaction.createdAt;
      item.updatedAt = transaction.updatedAt;
      return item;
    });

    return new GetMyTransactionsResponseDto(transactionItems, total);
  }
}
