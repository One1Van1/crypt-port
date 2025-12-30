import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { Shift } from '../../../entities/shift.entity';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { GetOperatorsAnalyticsQueryDto } from './operators.query.dto';
import { GetOperatorsAnalyticsResponseDto, OperatorStatsDto } from './operators.response.dto';

@Injectable()
export class GetOperatorsAnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetOperatorsAnalyticsQueryDto): Promise<GetOperatorsAnalyticsResponseDto> {
    // Получаем всех операторов
    const operators = await this.userRepository.find({
      where: { role: UserRole.OPERATOR },
    });

    const stats: OperatorStatsDto[] = [];

    for (const operator of operators) {
      // Строим запрос смен
      const shiftsQuery = this.shiftRepository
        .createQueryBuilder('shift')
        .where('shift.userId = :userId', { userId: operator.id })
        .andWhere('shift.status = :status', { status: ShiftStatus.COMPLETED });

      if (query.startDate && query.endDate) {
        shiftsQuery.andWhere('shift.startTime BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      } else if (query.startDate) {
        shiftsQuery.andWhere('shift.startTime >= :startDate', { startDate: query.startDate });
      } else if (query.endDate) {
        shiftsQuery.andWhere('shift.startTime <= :endDate', { endDate: query.endDate });
      }

      const shifts = await shiftsQuery.getMany();

      // Строим запрос транзакций
      const transactionsQuery = this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId', { userId: operator.id });

      if (query.startDate && query.endDate) {
        transactionsQuery.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      } else if (query.startDate) {
        transactionsQuery.andWhere('transaction.createdAt >= :startDate', { startDate: query.startDate });
      } else if (query.endDate) {
        transactionsQuery.andWhere('transaction.createdAt <= :endDate', { endDate: query.endDate });
      }

      const transactions = await transactionsQuery.getMany();

      // Подсчет статистики
      const totalShifts = shifts.length;
      const totalDuration = shifts.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalTransactions = transactions.length;
      const completedTransactions = transactions.filter((t) => t.status === TransactionStatus.COMPLETED).length;
      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const completedAmount = transactions
        .filter((t) => t.status === TransactionStatus.COMPLETED)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;
      const avgAmountPerTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
      const avgDuration = totalShifts > 0 ? totalDuration / totalShifts : 0;
      const avgTransactionsPerShift = totalShifts > 0 ? totalTransactions / totalShifts : 0;

      stats.push(
        new OperatorStatsDto({
          operatorId: operator.id,
          operatorUsername: operator.username,
          totalShifts,
          totalDuration,
          totalTransactions,
          completedTransactions,
          totalAmount,
          completedAmount,
          successRate,
          avgAmountPerTransaction,
          avgDuration,
          avgTransactionsPerShift,
        }),
      );
    }

    // Сортируем по completedAmount DESC
    stats.sort((a, b) => b.completedAmount - a.completedAmount);

    return new GetOperatorsAnalyticsResponseDto(stats);
  }
}
