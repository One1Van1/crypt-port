import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../../../entities/bank.entity';
import { UpdateBankRequestDto } from './update.request.dto';
import { UpdateBankResponseDto } from './update.response.dto';

@Injectable()
export class UpdateBankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async execute(id: string, dto: UpdateBankRequestDto): Promise<UpdateBankResponseDto> {
    const bank = await this.bankRepository.findOne({ where: { id } });

    if (!bank) {
      throw new NotFoundException('Bank not found');
    }

    if (dto.name && dto.name !== bank.name) {
      const existingBank = await this.bankRepository.findOne({
        where: { name: dto.name },
      });

      if (existingBank) {
        throw new ConflictException('Bank with this name already exists');
      }
    }

    Object.assign(bank, dto);
    const updatedBank = await this.bankRepository.save(bank);

    return new UpdateBankResponseDto(updatedBank);
  }
}
