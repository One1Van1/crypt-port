import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../../../entities/exchange-rate.entity';
import { ExchangeRateResponseDto } from '../set-rate/set-rate.response.dto';

@Injectable()
export class GetCurrentRateService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async execute(): Promise<ExchangeRateResponseDto> {
    const currentRate = await this.exchangeRateRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!currentRate) {
      throw new NotFoundException('No active exchange rate found');
    }

    return new ExchangeRateResponseDto(currentRate);
  }
}
