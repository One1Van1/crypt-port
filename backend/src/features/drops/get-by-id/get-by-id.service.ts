import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drop } from '../../../entities/drop.entity';
import { GetDropByIdResponseDto } from './get-by-id.response.dto';

@Injectable()
export class GetDropByIdService {
  constructor(
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(id: number): Promise<GetDropByIdResponseDto> {
    const drop = await this.dropRepository.findOne({
      where: { id },
      relations: ['bankAccounts', 'bankAccounts.bank'],
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    return new GetDropByIdResponseDto(drop);
  }
}
