import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drop } from '../../../entities/drop.entity';
import { UpdateDropRequestDto } from './update.request.dto';
import { UpdateDropResponseDto } from './update.response.dto';

@Injectable()
export class UpdateDropService {
  constructor(
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(id: number, dto: UpdateDropRequestDto): Promise<UpdateDropResponseDto> {
    const drop = await this.dropRepository.findOne({ where: { id } });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    Object.assign(drop, dto);
    const updatedDrop = await this.dropRepository.save(drop);

    return new UpdateDropResponseDto(updatedDrop);
  }
}
