import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { GetBankAccountByIdResponseDto } from './get-by-id.response.dto';

@Injectable()
export class GetBankAccountByIdService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(id: number): Promise<GetBankAccountByIdResponseDto> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: ['bank', 'drop', 'transactions'],
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return new GetBankAccountByIdResponseDto(bankAccount);
  }
}
