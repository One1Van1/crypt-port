import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { DropNeoBankFreezeEvent } from '../../../entities/drop-neo-bank-freeze-event.entity';
import { FreezeDropNeoBankRequestDto } from './freeze.request.dto';
import { FreezeDropNeoBankResponseDto } from './freeze.response.dto';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { User } from '../../../entities/user.entity';

@Injectable()
export class FreezeDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(DropNeoBankFreezeEvent)
    private readonly freezeEventRepository: Repository<DropNeoBankFreezeEvent>,
  ) {}

  async execute(id: number, dto: FreezeDropNeoBankRequestDto, user: User): Promise<FreezeDropNeoBankResponseDto> {
    const neoBank = await this.dropNeoBankRepository.findOne({ where: { id } });

    if (!neoBank) {
      throw new NotFoundException('Neo-bank not found');
    }

    neoBank.status = NeoBankStatus.FROZEN;
    neoBank.frozenAmount = dto.frozenAmount;

    await this.dropNeoBankRepository.save(neoBank);

    const event = this.freezeEventRepository.create({
      neoBankId: neoBank.id,
      performedByUserId: user.id,
      action: 'freeze',
      frozenAmount: dto.frozenAmount,
    });

    await this.freezeEventRepository.save(event);

    return new FreezeDropNeoBankResponseDto({
      id: neoBank.id,
      status: neoBank.status,
      frozenAmount: Number(neoBank.frozenAmount),
      updatedAt: neoBank.updatedAt,
    });
  }
}
