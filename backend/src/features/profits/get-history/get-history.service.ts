import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profit } from '../../../entities/profit.entity';
import { GetProfitHistoryResponseDto, ProfitHistoryItemDto } from './get-history.response.dto';

@Injectable()
export class GetProfitHistoryService {
  constructor(
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
  ) {}

  async execute(): Promise<GetProfitHistoryResponseDto> {
    const [profits, total] = await this.profitRepository.findAndCount({
      relations: ['createdByUser'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
      take: 100, // Last 100 profit withdrawals
    });

    const items = profits.map(
      (profit) =>
        new ProfitHistoryItemDto(
          profit.id,
          profit.withdrawnUsdt,
          profit.adminRate,
          profit.profitPesos,
          profit.returnedToSection,
          profit.returnedAmountPesos,
          profit.createdByUserId,
          profit.createdByUser?.email || 'Unknown',
          profit.createdAt,
        ),
    );

    return new GetProfitHistoryResponseDto(items, total);
  }
}
