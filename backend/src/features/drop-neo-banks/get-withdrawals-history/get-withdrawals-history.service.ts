import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeoBankWithdrawal } from '../../../entities/neo-bank-withdrawal.entity';
import { GetNeoBankWithdrawalsHistoryQueryDto } from './get-withdrawals-history.query.dto';
import {
  GetNeoBankWithdrawalsHistoryResponseDto,
  NeoBankWithdrawalsHistoryItemDto,
  NeoBankWithdrawalsHistoryUserDto,
} from './get-withdrawals-history.response.dto';

@Injectable()
export class GetNeoBankWithdrawalsHistoryService {
  constructor(
    @InjectRepository(NeoBankWithdrawal)
    private readonly withdrawalRepository: Repository<NeoBankWithdrawal>,
  ) {}

  async execute(query: GetNeoBankWithdrawalsHistoryQueryDto): Promise<GetNeoBankWithdrawalsHistoryResponseDto> {
    const take = query.limit ?? 20;
    const skip = query.offset ?? 0;

    const [items, total] = await this.withdrawalRepository.findAndCount({
      where: { neoBankId: query.neoBankId },
      relations: ['withdrawnByUser'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return new GetNeoBankWithdrawalsHistoryResponseDto(
      items.map(
        (w) =>
          new NeoBankWithdrawalsHistoryItemDto({
            id: w.id,
            amount: Number(w.amount),
            transactionId: w.transactionId,
            createdAt: w.createdAt.toISOString(),
            withdrawnByUser: new NeoBankWithdrawalsHistoryUserDto({
              id: w.withdrawnByUser?.id,
              username: w.withdrawnByUser?.username,
              email: (w.withdrawnByUser as any)?.email,
            }),
          }),
      ),
      total,
    );
  }
}
