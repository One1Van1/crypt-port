import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { AdjustBalanceRequestDto } from './adjust.request.dto';
import { AdjustBalanceResponseDto } from './adjust.response.dto';

@Injectable()
export class AdjustBalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  async execute(id: number, dto: AdjustBalanceRequestDto): Promise<AdjustBalanceResponseDto> {
    const balance = await this.balanceRepository.findOne({
      where: { id },
      relations: ['platform'],
    });

    if (!balance) {
      throw new NotFoundException('Balance not found');
    }

    const previousAmount = Number(balance.amount);
    const newAmount = previousAmount + dto.adjustment;

    if (newAmount < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative balance: ${previousAmount} + ${dto.adjustment} = ${newAmount}`,
      );
    }

    balance.amount = newAmount;
    if (dto.description) {
      balance.description = dto.description;
    }

    const updatedBalance = await this.balanceRepository.save(balance);

    return new AdjustBalanceResponseDto(updatedBalance, previousAmount, dto.adjustment);
  }
}
