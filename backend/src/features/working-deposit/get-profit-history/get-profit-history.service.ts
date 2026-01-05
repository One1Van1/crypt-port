import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { DailyProfit } from '../../../entities/daily-profit.entity';
import { GetProfitHistoryQueryDto } from './get-profit-history.query.dto';
import { GetProfitHistoryResponseDto, DailyProfitDto } from './get-profit-history.response.dto';

@Injectable()
export class GetProfitHistoryService {
  constructor(
    @InjectRepository(DailyProfit)
    private readonly dailyProfitRepository: Repository<DailyProfit>,
  ) {}

  async execute(query: GetProfitHistoryQueryDto): Promise<GetProfitHistoryResponseDto> {
    const days = query.days || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const profits = await this.dailyProfitRepository.find({
      where: {
        date: MoreThanOrEqual(startDate.toISOString().split('T')[0]),
      },
      order: {
        date: 'ASC',
      },
    });

    const history = profits.map(
      (profit) =>
        new DailyProfitDto(
          profit.date,
          profit.totalUsdt,
          profit.initialDeposit,
          profit.profit,
        ),
    );

    return new GetProfitHistoryResponseDto(history);
  }
}
