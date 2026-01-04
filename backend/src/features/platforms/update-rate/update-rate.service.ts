import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { UpdateExchangeRateRequestDto } from './update-rate.request.dto';
import { UpdateExchangeRateResponseDto } from './update-rate.response.dto';

@Injectable()
export class UpdateExchangeRateService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(id: number, dto: UpdateExchangeRateRequestDto): Promise<UpdateExchangeRateResponseDto> {
    // DEPRECATED: Exchange rate is now global, use POST /exchange-rates/set instead
    throw new BadRequestException(
      'This endpoint is deprecated. Exchange rate is now global. ' +
      'Please use POST /exchange-rates/set to update the exchange rate for all platforms.'
    );
  }
}
