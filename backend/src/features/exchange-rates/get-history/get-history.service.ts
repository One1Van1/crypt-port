import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../../../entities/exchange-rate.entity';
import { GetHistoryResponseDto } from './get-history.response.dto';
import { ExchangeRateResponseDto } from '../set-rate/set-rate.response.dto';

@Injectable()
export class GetHistoryService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async execute(): Promise<GetHistoryResponseDto> {
    const [items, total] = await this.exchangeRateRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const dtos = items.map(item => new ExchangeRateResponseDto(item));

    return new GetHistoryResponseDto(dtos, total);
  }
}
