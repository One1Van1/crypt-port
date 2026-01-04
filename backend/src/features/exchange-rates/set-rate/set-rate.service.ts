import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../../../entities/exchange-rate.entity';
import { SetExchangeRateDto } from './set-rate.dto';
import { ExchangeRateResponseDto } from './set-rate.response.dto';

@Injectable()
export class SetExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async execute(dto: SetExchangeRateDto, userId: number): Promise<ExchangeRateResponseDto> {
    // Деактивировать все предыдущие курсы
    await this.exchangeRateRepository.update(
      { isActive: true },
      { isActive: false },
    );

    // Создать новый активный курс
    const newRate = this.exchangeRateRepository.create({
      rate: dto.rate,
      setByUserId: userId,
      isActive: true,
    });

    const savedRate = await this.exchangeRateRepository.save(newRate);

    return new ExchangeRateResponseDto(savedRate);
  }
}
