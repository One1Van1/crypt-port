import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../../../entities/bank.entity';
import { UpdateBankStatusRequestDto } from './update-status.request.dto';
import { UpdateBankStatusResponseDto } from './update-status.response.dto';

@Injectable()
export class UpdateBankStatusService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async execute(id: number, dto: UpdateBankStatusRequestDto): Promise<UpdateBankStatusResponseDto> {
    const bank = await this.bankRepository.findOne({ where: { id } });

    if (!bank) {
      throw new NotFoundException('Bank not found');
    }

    bank.status = dto.status;
    const updatedBank = await this.bankRepository.save(bank);

    return new UpdateBankStatusResponseDto(updatedBank);
  }
}
