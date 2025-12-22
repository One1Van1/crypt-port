import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { Platform } from '../../../entities/platform.entity';
import { CreateBalanceRequestDto } from './create.request.dto';
import { CreateBalanceResponseDto } from './create.response.dto';
import { BalanceType } from '../../../common/enums/balance.enum';

@Injectable()
export class CreateBalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(dto: CreateBalanceRequestDto): Promise<CreateBalanceResponseDto> {
    // Проверяем существование площадки
    const platform = await this.platformRepository.findOne({
      where: { id: dto.platformId },
    });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    // Проверяем уникальность типа для площадки
    const existingBalance = await this.balanceRepository.findOne({
      where: {
        platform: { id: dto.platformId },
        type: dto.type,
      },
    });

    if (existingBalance) {
      throw new BadRequestException(`Balance of type ${dto.type} already exists for this platform`);
    }

    // Создаем баланс
    const balance = this.balanceRepository.create({
      amount: dto.amount,
      type: dto.type,
      platform: platform,
    });

    const savedBalance = await this.balanceRepository.save(balance);

    // Загружаем с relations
    const result = await this.balanceRepository.findOne({
      where: { id: savedBalance.id },
      relations: ['platform'],
    });

    return new CreateBalanceResponseDto(result);
  }
}
