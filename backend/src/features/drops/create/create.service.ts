import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drop } from '../../../entities/drop.entity';
import { CreateDropRequestDto } from './create.request.dto';
import { CreateDropResponseDto } from './create.response.dto';

@Injectable()
export class CreateDropService {
  constructor(
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(dto: CreateDropRequestDto): Promise<CreateDropResponseDto> {
    const drop = this.dropRepository.create(dto);
    const savedDrop = await this.dropRepository.save(drop);

    return new CreateDropResponseDto(savedDrop);
  }
}
