import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { GetTransactionByIdResponseDto } from './get-by-id.response.dto';

@Injectable()
export class GetTransactionByIdService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(id: number): Promise<GetTransactionByIdResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['shift', 'bankAccount', 'bankAccount.bank', 'bankAccount.drop', 'platform', 'user'],
      withDeleted: true,
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.deletedAt) {
      throw new NotFoundException('Transaction not found');
    }

    return new GetTransactionByIdResponseDto(transaction);
  }
}
