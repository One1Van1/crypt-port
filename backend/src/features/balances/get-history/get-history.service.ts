import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { GetBalanceHistoryQueryDto } from './get-history.query.dto';
import { GetBalanceHistoryResponseDto } from './get-history.response.dto';

@Injectable()
export class GetBalanceHistoryService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  async execute(query: GetBalanceHistoryQueryDto): Promise<GetBalanceHistoryResponseDto> {
    const where: any = {};
    
    if (query.platformId) {
      where.platformId = query.platformId;
    }

    const [items, total] = await this.balanceRepository.findAndCount({
      where,
      relations: ['platform'],
      order: { updatedAt: 'DESC' },
      take: query.limit || 50,
    });

    return new GetBalanceHistoryResponseDto(items, total);
  }
}
