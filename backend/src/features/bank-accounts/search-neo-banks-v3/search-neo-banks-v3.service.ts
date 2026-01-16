import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Brackets } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { NeoBankWithdrawal } from '../../../entities/neo-bank-withdrawal.entity';
import { Shift } from '../../../entities/shift.entity';
import { User } from '../../../entities/user.entity';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { SearchNeoBanksV3QueryDto } from './search-neo-banks-v3.query.dto';
import { SearchNeoBanksV3ItemDto, SearchNeoBanksV3ResponseDto } from './search-neo-banks-v3.response.dto';

@Injectable()
export class SearchNeoBanksV3Service {
  constructor(private readonly dataSource: DataSource) {}

  async execute(user: User, query: SearchNeoBanksV3QueryDto): Promise<SearchNeoBanksV3ResponseDto> {
    const shiftRepository = this.dataSource.getRepository(Shift);

    const activeShift = await shiftRepository.findOne({
      where: {
        userId: user.id,
        status: ShiftStatus.ACTIVE,
      },
      relations: ['platform'],
    });

    if (!activeShift || !activeShift.platform) {
      throw new NotFoundException('Активная смена не найдена. Сначала откройте смену.');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const search = (query.search ?? '').trim();

    const dropNeoBankRepository = this.dataSource.getRepository(DropNeoBank);

    const qb = dropNeoBankRepository
      .createQueryBuilder('neoBank')
      .leftJoinAndSelect('neoBank.drop', 'drop')
      .where('neoBank.status = :status', { status: NeoBankStatus.ACTIVE })
      .andWhere('neoBank.platformId = :platformId', { platformId: activeShift.platformId });

    if (search) {
      // Treat whitespace as a flexible separator so that e.g. "Satoshi Tango" matches "Satoshi_Tango"
      // or other non-space separators in stored values.
      const like = `%${search.replace(/\s+/g, '%')}%`;
      const digits = search.replace(/\D/g, '');
      const last4 = digits.length === 4 ? digits : null;

      qb.andWhere(
        new Brackets((w) => {
          w.where('drop.name ILIKE :like', { like })
            .orWhere('neoBank.provider ILIKE :like', { like })
            .orWhere('neoBank.alias ILIKE :like', { like })
            .orWhere('neoBank.accountId ILIKE :like', { like });

          if (last4) {
            w.orWhere('RIGHT(neoBank.accountId, 4) = :last4', { last4 });
          }
        }),
      );

      // If user provided exactly 4 digits, treat it as last4 search only (more predictable)
      if (digits.length === 4 && digits === search) {
        qb.andWhere('RIGHT(neoBank.accountId, 4) = :last4Only', { last4Only: digits });
      }
    }

    qb.orderBy('neoBank.provider', 'ASC')
      .addOrderBy('neoBank.accountId', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [neoBanks, total] = await qb.getManyAndCount();

    const neoBankIds = neoBanks.map((nb) => nb.id);
    const withdrawalRepository = this.dataSource.getRepository(NeoBankWithdrawal);

    const dailyUsedByNeoBank = new Map<number, number>();
    const monthlyUsedByNeoBank = new Map<number, number>();

    if (neoBankIds.length > 0) {
      const dailyRows = await withdrawalRepository
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

      const monthlyRows = await withdrawalRepository
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

    const items = neoBanks.map(
      (neoBank) =>
        new SearchNeoBanksV3ItemDto({
          id: neoBank.id,
          provider: neoBank.provider,
          accountId: neoBank.accountId,
          alias: neoBank.alias,
          dailyLimit:
            neoBank.dailyLimit === null
              ? null
              : Number(neoBank.dailyLimit) - (dailyUsedByNeoBank.get(neoBank.id) ?? 0),
          monthlyLimit:
            neoBank.monthlyLimit === null
              ? null
              : Number(neoBank.monthlyLimit) - (monthlyUsedByNeoBank.get(neoBank.id) ?? 0),
          dropId: neoBank.dropId,
          dropName: neoBank.drop?.name ?? '—',
        }),
    );

    return new SearchNeoBanksV3ResponseDto({ items, total });
  }
}
