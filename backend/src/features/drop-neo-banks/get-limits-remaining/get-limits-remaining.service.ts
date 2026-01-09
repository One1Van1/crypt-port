import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { NeoBankWithdrawal } from '../../../entities/neo-bank-withdrawal.entity';
import { GetNeoBankLimitsRemainingQueryDto } from './get-limits-remaining.query.dto';
import {
  GetNeoBankLimitsRemainingItemDto,
  GetNeoBankLimitsRemainingResponseDto,
} from './get-limits-remaining.response.dto';

@Injectable()
export class GetNeoBankLimitsRemainingService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(NeoBankWithdrawal)
    private readonly withdrawalRepository: Repository<NeoBankWithdrawal>,
  ) {}

  async execute(query: GetNeoBankLimitsRemainingQueryDto): Promise<GetNeoBankLimitsRemainingResponseDto> {
    const qb = this.dropNeoBankRepository
      .createQueryBuilder('neoBank')
      .leftJoinAndSelect('neoBank.drop', 'drop')
      .leftJoinAndSelect('neoBank.platform', 'platform');

    if (query.dropId) {
      qb.andWhere('neoBank.dropId = :dropId', { dropId: query.dropId });
    }

    if (query.platformId) {
      qb.andWhere('neoBank.platformId = :platformId', { platformId: query.platformId });
    }

    if (query.provider) {
      qb.andWhere('neoBank.provider = :provider', { provider: query.provider });
    }

    if (query.status) {
      qb.andWhere('neoBank.status = :status', { status: query.status });
    }

    const neoBanks = await qb.orderBy('platform.name', 'ASC').addOrderBy('drop.name', 'ASC').addOrderBy('neoBank.provider', 'ASC').addOrderBy('neoBank.accountId', 'ASC').getMany();

    const neoBankIds = neoBanks.map((n) => n.id);
    const dailyUsedByNeoBank = new Map<number, number>();
    const monthlyUsedByNeoBank = new Map<number, number>();

    if (neoBankIds.length > 0) {
      const dailyRows = await this.withdrawalRepository
        .createQueryBuilder('w')
        .select('w.neoBankId', 'neoBankId')
        .addSelect('COALESCE(SUM(w.amount), 0)', 'used')
        .where('w.neoBankId IN (:...ids)', { ids: neoBankIds })
        .andWhere("w.createdAt >= date_trunc('day', now())")
        .groupBy('w.neoBankId')
        .getRawMany<{ neoBankId: string; used: string }>();

      for (const row of dailyRows) {
        dailyUsedByNeoBank.set(Number(row.neoBankId), Number(row.used));
      }

      const monthlyRows = await this.withdrawalRepository
        .createQueryBuilder('w')
        .select('w.neoBankId', 'neoBankId')
        .addSelect('COALESCE(SUM(w.amount), 0)', 'used')
        .where('w.neoBankId IN (:...ids)', { ids: neoBankIds })
        .andWhere("w.createdAt >= date_trunc('month', now())")
        .groupBy('w.neoBankId')
        .getRawMany<{ neoBankId: string; used: string }>();

      for (const row of monthlyRows) {
        monthlyUsedByNeoBank.set(Number(row.neoBankId), Number(row.used));
      }
    }

    const items = neoBanks.map((neoBank) => {
      const dailyLimit = neoBank.dailyLimit === null ? null : Number(neoBank.dailyLimit);
      const monthlyLimit = neoBank.monthlyLimit === null ? null : Number(neoBank.monthlyLimit);
      const dailyUsed = dailyUsedByNeoBank.get(neoBank.id) ?? 0;
      const monthlyUsed = monthlyUsedByNeoBank.get(neoBank.id) ?? 0;

      return new GetNeoBankLimitsRemainingItemDto({
        id: neoBank.id,
        provider: neoBank.provider,
        accountId: neoBank.accountId,
        dropId: neoBank.dropId,
        dropName: neoBank.drop?.name ?? 'Unknown',
        platformId: neoBank.platformId ?? null,
        platformName: neoBank.platform?.name ?? null,
        status: String(neoBank.status).toLowerCase(),
        alias: neoBank.alias ?? null,
        dailyLimit,
        dailyLimitRemaining: dailyLimit === null ? null : Math.max(0, dailyLimit - dailyUsed),
        monthlyLimit,
        monthlyLimitRemaining: monthlyLimit === null ? null : Math.max(0, monthlyLimit - monthlyUsed),
      });
    });

    return new GetNeoBankLimitsRemainingResponseDto(items);
  }
}
