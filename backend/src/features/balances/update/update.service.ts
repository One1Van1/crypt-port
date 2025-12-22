import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { UpdateBalanceRequestDto } from './update.request.dto';
import { UpdateBalanceResponseDto } from './update.response.dto';

@Injectable()
export class UpdateBalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  async execute(id: number, dto: UpdateBalanceRequestDto): Promise<UpdateBalanceResponseDto> {
    const balance = await this.balanceRepository.findOne({
      where: { id },
      relations: ['platform'],
    });

    if (!balance) {
      throw new NotFoundException('Balance not found');
    }

    // Обновляем сумму
    balance.amount = dto.amount;

    const updatedBalance = await this.balanceRepository.save(balance);

    return new UpdateBalanceResponseDto(updatedBalance);
  }
}
