import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { GetFreeUsdtDistributionsQueryDto } from './get-distributions.query.dto';
import {
  FreeUsdtDistributionItemDto,
  GetFreeUsdtDistributionsResponseDto,
} from './get-distributions.response.dto';

@Injectable()
export class GetFreeUsdtDistributionsService {
  constructor(
    @InjectRepository(FreeUsdtDistribution)
    private readonly distributionRepository: Repository<FreeUsdtDistribution>,
  ) {}

  async execute(query: GetFreeUsdtDistributionsQueryDto): Promise<GetFreeUsdtDistributionsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [items, total] = await this.distributionRepository.findAndCount({
      relations: ['platform', 'distributedByUser'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const dtoItems = items.map(
      (d) =>
        new FreeUsdtDistributionItemDto(
          d.id,
          d.platformId,
          d.platform?.name || 'Unknown',
          Number(d.amountUsdt),
          d.distributedByUserId,
          d.distributedByUser?.username || 'Unknown',
          d.comment ?? null,
          d.createdAt,
        ),
    );

    return new GetFreeUsdtDistributionsResponseDto(dtoItems, total);
  }
}
