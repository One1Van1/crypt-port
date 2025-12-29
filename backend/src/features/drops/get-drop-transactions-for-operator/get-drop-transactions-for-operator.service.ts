import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { GetDropTransactionsForOperatorQueryDto } from './get-drop-transactions-for-operator.query.dto';
import { GetDropTransactionsForOperatorResponseDto } from './get-drop-transactions-for-operator.response.dto';

@Injectable()
export class GetDropTransactionsForOperatorService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(
    dropId: number,
    operatorId: number,
    query: GetDropTransactionsForOperatorQueryDto,
  ): Promise<GetDropTransactionsForOperatorResponseDto> {
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.bankAccount', 'ba')
      .leftJoinAndSelect('ba.bank', 'bank')
      .leftJoinAndSelect('ba.drop', 'drop')
      .where('drop.id = :dropId', { dropId })
      .andWhere('t.operatorId = :operatorId', { operatorId })
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
      bankName: t.bankAccount?.bank?.name || 'Unknown',
    }));

    return new GetDropTransactionsForOperatorResponseDto(transactions, total);
  }
}
