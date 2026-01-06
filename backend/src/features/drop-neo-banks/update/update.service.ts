import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Drop } from '../../../entities/drop.entity';
import { Platform } from '../../../entities/platform.entity';
import { UpdateDropNeoBankRequestDto } from './update.request.dto';
import { PlatformStatus } from '../../../common/enums/platform.enum';

@Injectable()
export class UpdateDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(id: number, dto: UpdateDropNeoBankRequestDto): Promise<DropNeoBank> {
    const dropNeoBank = await this.dropNeoBankRepository.findOne({
      where: { id },
      relations: ['drop', 'platform'],
    });

    if (!dropNeoBank) {
      throw new NotFoundException('Drop neo bank not found');
    }

    let nextDrop: Drop | undefined;
    if (dto.dropId !== undefined) {
      nextDrop = await this.dropRepository.findOne({ where: { id: dto.dropId } });
      if (!nextDrop) throw new NotFoundException('Drop not found');
    }

    let nextPlatform: Platform | undefined;
    if (dto.platformId !== undefined) {
      nextPlatform = await this.platformRepository.findOne({ where: { id: dto.platformId } });
      if (!nextPlatform) throw new NotFoundException('Platform not found');
      if (nextPlatform.status !== PlatformStatus.ACTIVE) {
        throw new BadRequestException('Platform is not active');
      }
    }

    const nextDropId = dto.dropId ?? dropNeoBank.dropId;
    const nextProvider = dto.provider ?? dropNeoBank.provider;
    const nextAccountId = dto.accountId ?? dropNeoBank.accountId;

    // Enforce uniqueness: (dropId, provider, accountId)
    if (nextDropId) {
      const existing = await this.dropNeoBankRepository.findOne({
        where: {
          dropId: nextDropId,
          provider: nextProvider,
          accountId: nextAccountId,
        },
      });

      if (existing && existing.id !== dropNeoBank.id) {
        throw new BadRequestException('This neo bank account already exists for this drop');
      }
    }

    if (dto.provider !== undefined) dropNeoBank.provider = dto.provider;
    if (dto.dropId !== undefined) {
      dropNeoBank.dropId = dto.dropId;
      dropNeoBank.drop = nextDrop;
    }

    if (dto.platformId !== undefined) {
      dropNeoBank.platformId = dto.platformId;
      dropNeoBank.platform = nextPlatform;
    }

    if (dto.accountId !== undefined) dropNeoBank.accountId = dto.accountId;
    if (dto.status !== undefined) dropNeoBank.status = dto.status;
    if (dto.comment !== undefined) dropNeoBank.comment = dto.comment;
    if (dto.currentBalance !== undefined) dropNeoBank.currentBalance = dto.currentBalance;

    return this.dropNeoBankRepository.save(dropNeoBank);
  }
}
