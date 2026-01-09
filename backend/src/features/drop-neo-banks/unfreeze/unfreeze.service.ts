import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { DropNeoBankFreezeEvent } from '../../../entities/drop-neo-bank-freeze-event.entity';
import { UnfreezeDropNeoBankResponseDto } from './unfreeze.response.dto';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { User } from '../../../entities/user.entity';

@Injectable()
export class UnfreezeDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(DropNeoBankFreezeEvent)
    private readonly freezeEventRepository: Repository<DropNeoBankFreezeEvent>,
  ) {}

  async execute(id: number, user: User): Promise<UnfreezeDropNeoBankResponseDto> {
    const neoBank = await this.dropNeoBankRepository.findOne({ where: { id } });

    if (!neoBank) {
      throw new NotFoundException('Neo-bank not found');
    }

    neoBank.status = NeoBankStatus.ACTIVE;
    neoBank.frozenAmount = 0;

    await this.dropNeoBankRepository.save(neoBank);

    const event = this.freezeEventRepository.create({
      neoBankId: neoBank.id,
      performedByUserId: user.id,
      action: 'unfreeze',
      frozenAmount: 0,
    });

    await this.freezeEventRepository.save(event);

    return new UnfreezeDropNeoBankResponseDto({
      id: neoBank.id,
      status: neoBank.status,
      frozenAmount: Number(neoBank.frozenAmount),
      updatedAt: neoBank.updatedAt,
    });
  }
}
