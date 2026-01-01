import { Injectable, NotFoundException } from '@nestjs/common';
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
    const platform = await this.platformRepository.findOne({ where: { id } });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    platform.exchangeRate = dto.exchangeRate;
    await this.platformRepository.save(platform);

    return new UpdateExchangeRateResponseDto(
      platform.id,
      platform.name,
      Number(platform.exchangeRate),
      platform.updatedAt,
    );
  }
}
