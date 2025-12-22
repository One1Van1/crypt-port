import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../../../entities/bank.entity';
import { CreateBankRequestDto } from './create.request.dto';
import { CreateBankResponseDto } from './create.response.dto';

@Injectable()
export class CreateBankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async execute(dto: CreateBankRequestDto): Promise<CreateBankResponseDto> {
    const existingBank = await this.bankRepository.findOne({
      where: { name: dto.name },
    });

    if (existingBank) {
      throw new ConflictException('Bank with this name already exists');
    }

    const bank = this.bankRepository.create(dto);
    const savedBank = await this.bankRepository.save(bank);

    return new CreateBankResponseDto(savedBank);
  }
}
