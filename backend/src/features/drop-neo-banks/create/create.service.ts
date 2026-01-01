import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Drop } from '../../../entities/drop.entity';
import { CreateDropNeoBankRequestDto } from './create.request.dto';
import { CreateDropNeoBankResponseDto } from './create.response.dto';

@Injectable()
export class CreateDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(dto: CreateDropNeoBankRequestDto): Promise<CreateDropNeoBankResponseDto> {
    // Проверяем существование дропа
    const drop = await this.dropRepository.findOne({
      where: { id: dto.dropId },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
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
      comment: dto.comment,      currentBalance: dto.currentBalance || 0,      drop: drop,
    });

    const saved = await this.dropNeoBankRepository.save(dropNeoBank);

    // Загружаем с relations
    const result = await this.dropNeoBankRepository.findOne({
      where: { id: saved.id },
      relations: ['drop'],
    });

    return new CreateDropNeoBankResponseDto(result);
  }
}
