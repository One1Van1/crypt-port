import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { UpdateDropNeoBankRequestDto } from './update.request.dto';

@Injectable()
export class UpdateDropNeoBankService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
  ) {}

  async execute(id: number, dto: UpdateDropNeoBankRequestDto): Promise<DropNeoBank> {
    const dropNeoBank = await this.dropNeoBankRepository.findOne({
      where: { id },
      relations: ['drop'],
    });

    if (!dropNeoBank) {
      throw new NotFoundException('Drop neo bank not found');
    }

    if (dto.accountId !== undefined) dropNeoBank.accountId = dto.accountId;
    if (dto.status !== undefined) dropNeoBank.status = dto.status;
    if (dto.comment !== undefined) dropNeoBank.comment = dto.comment;
    if (dto.currentBalance !== undefined) dropNeoBank.currentBalance = dto.currentBalance;

    return this.dropNeoBankRepository.save(dropNeoBank);
  }
}
