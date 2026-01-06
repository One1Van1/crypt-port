import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsdtToPesoExchange } from '../../../entities/usdt-to-peso-exchange.entity';
import { GetPlatformExchangesQueryDto } from './get-exchanges.query.dto';
import { GetPlatformExchangesResponseDto } from './get-exchanges.response.dto';

@Injectable()
export class GetPlatformExchangesService {
  constructor(
    @InjectRepository(UsdtToPesoExchange)
    private readonly exchangeRepository: Repository<UsdtToPesoExchange>,
  ) {}

  async execute(query: GetPlatformExchangesQueryDto): Promise<GetPlatformExchangesResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const where = query.platformId ? { platformId: query.platformId } : {};

    const [items, total] = await this.exchangeRepository.findAndCount({
      where,
      relations: ['platform'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return new GetPlatformExchangesResponseDto(items, total);
  }
}
