import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { GetAvailableBankAccountQueryDto } from './get-available.query.dto';
import { GetAvailableBankAccountResponseDto } from './get-available.response.dto';

@Injectable()
export class GetAvailableBankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(query: GetAvailableBankAccountQueryDto): Promise<GetAvailableBankAccountResponseDto> {
    const requiredAmount = query.amount;

    // Получаем доступные аккаунты с приоритетом
    const queryBuilder = this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .where('bankAccount.status = :status', { status: BankAccountStatus.WORKING })
      .andWhere('(bankAccount.limit - bankAccount.withdrawnAmount) >= :amount', {
        amount: requiredAmount,
      })
      // Сортировка: сначала по приоритету (меньше = выше), затем по дате последнего использования
      .orderBy('bankAccount.priority', 'ASC')
      .addOrderBy('bankAccount.lastUsedAt', 'ASC', 'NULLS FIRST');

    // Фильтр по банку (если указан)
    if (query.bankId) {
      queryBuilder.andWhere('bankAccount.bankId = :bankId', { bankId: query.bankId });
    }

    // Получаем первый доступный аккаунт
    const bankAccount = await queryBuilder.getOne();

    if (!bankAccount) {
      throw new NotFoundException(
        'No available bank account found with sufficient balance for the requested amount',
      );
    }

    return new GetAvailableBankAccountResponseDto(bankAccount);
  }
}
