import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { TransactionV2ItemDto } from '../get-all-v2/get-all-v2.response.dto';

@Injectable()
export class GetTransactionByIdV2Service {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(id: number): Promise<TransactionV2ItemDto> {
    const transaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .withDeleted()
      .leftJoinAndSelect('transaction.shift', 'shift')
      .leftJoinAndSelect('shift.platform', 'platform')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.sourceDropNeoBank', 'sourceDropNeoBank')
      .where('transaction.id = :id', { id })
      .andWhere('transaction.deletedAt IS NULL')
      .getOne();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return new TransactionV2ItemDto(transaction);
  }
}
