import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../../../entities/bank.entity';
import { GetBankByIdResponseDto } from './get-by-id.response.dto';

@Injectable()
export class GetBankByIdService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async execute(id: number): Promise<GetBankByIdResponseDto> {
    const bank = await this.bankRepository.findOne({ where: { id } });

    if (!bank) {
      throw new NotFoundException('Bank not found');
    }

    return new GetBankByIdResponseDto(bank);
  }
}
