import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBankFreezeEvent } from '../../../entities/drop-neo-bank-freeze-event.entity';
import { GetDropNeoBankFreezeHistoryQueryDto } from './get-freeze-history.query.dto';
import { GetDropNeoBankFreezeHistoryResponseDto } from './get-freeze-history.response.dto';

@Injectable()
export class GetDropNeoBankFreezeHistoryService {
  constructor(
    @InjectRepository(DropNeoBankFreezeEvent)
    private readonly freezeEventRepository: Repository<DropNeoBankFreezeEvent>,
  ) {}

  async execute(query: GetDropNeoBankFreezeHistoryQueryDto): Promise<GetDropNeoBankFreezeHistoryResponseDto> {
    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [items, total] = await this.freezeEventRepository.findAndCount({
      where: { neoBankId: query.neoBankId },
      relations: ['performedByUser'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return new GetDropNeoBankFreezeHistoryResponseDto(items, total);
  }
}
