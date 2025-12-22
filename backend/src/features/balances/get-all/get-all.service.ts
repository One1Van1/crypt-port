import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { GetAllBalancesQueryDto } from './get-all.query.dto';
import { GetAllBalancesResponseDto, BalanceItemDto } from './get-all.response.dto';

@Injectable()
export class GetAllBalancesService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  async execute(query: GetAllBalancesQueryDto): Promise<GetAllBalancesResponseDto> {
    const queryBuilder = this.balanceRepository
      .createQueryBuilder('balance')
      .leftJoinAndSelect('balance.platform', 'platform');

    // Фильтр по типу
    if (query.type) {
      queryBuilder.andWhere('balance.type = :type', { type: query.type });
    }

    // Фильтр по площадке
    if (query.platformId) {
      queryBuilder.andWhere('balance.platformId = :platformId', { platformId: query.platformId });
    }

    // Сортировка
    queryBuilder.orderBy('platform.name', 'ASC').addOrderBy('balance.type', 'ASC');

    const items = await queryBuilder.getMany();

    return new GetAllBalancesResponseDto(items.map((b) => new BalanceItemDto(b)));
  }
}
