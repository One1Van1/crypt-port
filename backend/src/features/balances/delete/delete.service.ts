import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';

@Injectable()
export class DeleteBalanceService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  async execute(id: string): Promise<void> {
    const balance = await this.balanceRepository.findOne({
      where: { id },
    });

    if (!balance) {
      throw new NotFoundException('Balance not found');
    }

    // Soft delete
    await this.balanceRepository.softRemove(balance);
  }
}
