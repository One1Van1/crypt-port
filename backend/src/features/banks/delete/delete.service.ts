import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../../../entities/bank.entity';
import { BankAccount } from '../../../entities/bank-account.entity';

@Injectable()
export class DeleteBankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(id: number): Promise<void> {
    const bank = await this.bankRepository.findOne({ where: { id } });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    const linkedAccountsCount = await this.bankAccountRepository.count({ where: { bankId: id } });
    if (linkedAccountsCount > 0) {
      throw new BadRequestException('Cannot delete bank with linked bank accounts');
    }

    await this.bankRepository.softDelete(id);
  }
}
