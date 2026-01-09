import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Drop } from '../../../entities/drop.entity';
import { Platform } from '../../../entities/platform.entity';
import { CreateDropNeoBankRequestDto } from './create.request.dto';
import { CreateDropNeoBankResponseDto } from './create.response.dto';
import { PlatformStatus } from '../../../common/enums/platform.enum';

@Injectable()
export class CreateDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(dto: CreateDropNeoBankRequestDto): Promise<CreateDropNeoBankResponseDto> {
    // Проверяем существование дропа
    const drop = await this.dropRepository.findOne({
      where: { id: dto.dropId },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    // Проверяем существование и статус платформы
    const platform = await this.platformRepository.findOne({
      where: { id: dto.platformId },
    });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    if (platform.status !== PlatformStatus.ACTIVE) {
      throw new BadRequestException('Platform is not active');
    }

    // Проверяем уникальность комбинации dropId + provider + accountId
    const existing = await this.dropNeoBankRepository.findOne({
      where: {
        dropId: dto.dropId,
        provider: dto.provider,
        accountId: dto.accountId,
      },
    });

    if (existing) {
      throw new BadRequestException('This neo bank account already exists for this drop');
    }

    // Создаем нео-банк
    const dropNeoBank = this.dropNeoBankRepository.create({
      provider: dto.provider,
      accountId: dto.accountId,
      alias: dto.alias,
      currentBalance: dto.currentBalance || 0,
      dailyLimit: dto.dailyLimit,
      monthlyLimit: dto.monthlyLimit,
      drop: drop,
      platform: platform,
    });

    const saved = await this.dropNeoBankRepository.save(dropNeoBank);

    // Загружаем с relations
    const result = await this.dropNeoBankRepository.findOne({
      where: { id: saved.id },
      relations: ['drop', 'platform'],
    });

    return new CreateDropNeoBankResponseDto(result);
  }
}
