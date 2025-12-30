import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { GetBankTransactionsForOperatorQueryDto } from './get-bank-transactions-for-operator.query.dto';
import { GetBankTransactionsForOperatorResponseDto } from './get-bank-transactions-for-operator.response.dto';

@Injectable()
export class GetBankTransactionsForOperatorService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(
    bankId: number,
    userId: number,
    query: GetBankTransactionsForOperatorQueryDto,
  ): Promise<GetBankTransactionsForOperatorResponseDto> {
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.bankAccount', 'ba')
      .leftJoinAndSelect('ba.bank', 'bank')
      .leftJoinAndSelect('ba.drop', 'drop')
      .where('bank.id = :bankId', { bankId })
      .andWhere('t.userId = :userId', { userId })
      .orderBy('t.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    const [items, total] = await queryBuilder.getManyAndCount();

    const transactions = items.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      amountUSDT: t.amountUSDT ? Number(t.amountUSDT) : null,
      status: t.status,
      comment: t.comment,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      bankAccountCbu: t.bankAccount?.cbu || 'Unknown',
      bankAccountAlias: t.bankAccount?.alias || 'Unknown',
      dropName: t.bankAccount?.drop?.name || 'Unknown',
    }));

    return new GetBankTransactionsForOperatorResponseDto(transactions, total);
  }
}
