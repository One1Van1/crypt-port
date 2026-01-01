import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { UpdateBalanceRequestDto } from './update-balance.request.dto';
import { UpdateBalanceResponseDto } from './update-balance.response.dto';

@Injectable()
export class UpdateBalanceService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
  ) {}

  async execute(id: number, dto: UpdateBalanceRequestDto): Promise<UpdateBalanceResponseDto> {
    const neoBank = await this.dropNeoBankRepository.findOne({
      where: { id },
    });

    if (!neoBank) {
      throw new NotFoundException('Neo-bank not found');
    }

    neoBank.currentBalance = dto.balance;
    await this.dropNeoBankRepository.save(neoBank);

    return new UpdateBalanceResponseDto(
      neoBank.id,
      Number(neoBank.currentBalance),
      neoBank.updatedAt,
    );
  }
}
