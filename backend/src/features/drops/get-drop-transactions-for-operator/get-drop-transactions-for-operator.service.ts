import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { GetDropTransactionsForOperatorQueryDto, UserFilterType } from './get-drop-transactions-for-operator.query.dto';
import { GetDropTransactionsForOperatorResponseDto } from './get-drop-transactions-for-operator.response.dto';
import { UserRole } from '../../../common/enums/user.enum';

@Injectable()
export class GetDropTransactionsForOperatorService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(
    dropId: number,
    currentUserId: number,
    query: GetDropTransactionsForOperatorQueryDto,
    userRole?: UserRole,
  ): Promise<GetDropTransactionsForOperatorResponseDto> {
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.bankAccount', 'ba')
      .leftJoinAndSelect('ba.bank', 'bank')
      .leftJoinAndSelect('ba.drop', 'drop')
      .leftJoinAndSelect('t.user', 'user')
      .leftJoinAndSelect('t.shift', 'shift')
      .where('drop.id = :dropId', { dropId });

    // Фильтрация по пользователю (для операторов всегда только свои)
    if (userRole === UserRole.OPERATOR) {
      queryBuilder.andWhere('t.userId = :userId', { userId: currentUserId });
    } else {
      // Для admin/teamlead применяем userFilter
      if (query.userFilter === UserFilterType.MY) {
        queryBuilder.andWhere('t.userId = :userId', { userId: currentUserId });
      } else if (query.userFilter === UserFilterType.OTHERS) {
        queryBuilder.andWhere('t.userId != :userId', { userId: currentUserId });
      }
      // Для ALL не добавляем условие - показываем всех
    }

    // Фильтр по роли пользователя
    if (query.userRole) {
      queryBuilder.andWhere('user.role = :userRole', { userRole: query.userRole });
    }

    // Фильтр по конкретному userId
    if (query.userId) {
      queryBuilder.andWhere('t.userId = :filteredUserId', { filteredUserId: query.userId });
    }

    // Поиск по username
    if (query.username) {
      queryBuilder.andWhere('user.username ILIKE :username', { username: `%${query.username}%` });
    }

    // Фильтр по имени банка
    if (query.bankName) {
      queryBuilder.andWhere('bank.name ILIKE :bankName', { bankName: `%${query.bankName}%` });
    }

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('t.status = :status', { status: query.status });
    }

    // Фильтр по дате
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('t.createdAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('t.createdAt >= :startDate', { startDate: query.startDate });
    } else if (query.endDate) {
      queryBuilder.andWhere('t.createdAt <= :endDate', { endDate: query.endDate });
    }

    // Фильтр по сумме
    if (query.minAmount !== undefined) {
      queryBuilder.andWhere('t.amount >= :minAmount', { minAmount: query.minAmount });
    }
    if (query.maxAmount !== undefined) {
      queryBuilder.andWhere('t.amount <= :maxAmount', { maxAmount: query.maxAmount });
    }

    queryBuilder
      .orderBy('t.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    const [items, total] = await queryBuilder.getManyAndCount();

    const transactions = items.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      amountUSDT: t.amountUSDT ? Number(t.amountUSDT) : null,
      status: t.status,
      comment: t.comment,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      bankAccountCbu: t.bankAccount?.cbu || 'Unknown',
      bankAccountAlias: t.bankAccount?.alias || 'Unknown',
      bankName: t.bankAccount?.bank?.name || 'Unknown',
    }));

    return new GetDropTransactionsForOperatorResponseDto(transactions, total);
  }
}
