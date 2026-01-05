import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { GetAllWithdrawalsResponseDto, WithdrawalItem } from './get-all-withdrawals.response.dto';
import { GetAllWithdrawalsQueryDto } from './get-all-withdrawals.query.dto';

@Injectable()
export class GetAllWithdrawalsService {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
  ) {}

  async execute(query: GetAllWithdrawalsQueryDto): Promise<GetAllWithdrawalsResponseDto> {
    console.log('GetAllWithdrawals called with query:', query);
    
    const queryBuilder = this.cashWithdrawalRepository
      .createQueryBuilder('cashWithdrawal')
      .leftJoinAndSelect('cashWithdrawal.withdrawnByUser', 'withdrawnByUser')
      .orderBy('cashWithdrawal.createdAt', 'DESC');

    // Filter by date if provided
    if (query.date) {
      // Parse date components to avoid timezone issues
      const [year, month, day] = query.date.split('-').map(Number);
      
      // Format dates as ISO strings without timezone conversion
      const startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
      
      // Next day
      const nextDay = new Date(year, month - 1, day + 1);
      const endYear = nextDay.getFullYear();
      const endMonth = nextDay.getMonth() + 1;
      const endDay = nextDay.getDate();
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}T00:00:00.000Z`;

      console.log('Filtering withdrawals:', { date: query.date, startDate, endDate });

      queryBuilder.andWhere(
        'cashWithdrawal.createdAt >= :startDate AND cashWithdrawal.createdAt < :endDate',
        {
          startDate,
          endDate,
        }
      );
    }

    const withdrawals = await queryBuilder.getMany();

    console.log(`Found ${withdrawals.length} withdrawals`);
    withdrawals.forEach(w => {
      console.log(`Withdrawal ${w.id}: createdAt = ${w.createdAt}`);
    });

    const items = withdrawals.map((withdrawal) => ({
      id: String(withdrawal.id),
      amountPesos: Number(withdrawal.amountPesos),
      withdrawalRate: Number(withdrawal.withdrawalRate),
      status: withdrawal.status,
      bankAccountId: withdrawal.bankAccountId,
      comment: withdrawal.comment,
      createdAt: withdrawal.createdAt,
      withdrawnByUser: withdrawal.withdrawnByUser
        ? {
            id: String(withdrawal.withdrawnByUser.id),
            username: withdrawal.withdrawnByUser.username,
          }
        : null,
    }));

    return { items };
  }
}
