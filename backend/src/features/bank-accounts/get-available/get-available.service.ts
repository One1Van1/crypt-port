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
    const queryBuilder = this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .where('bankAccount.status = :status', { status: BankAccountStatus.WORKING })
      .andWhere('(bankAccount.limitAmount - bankAccount.withdrawnAmount) > :minAmount', {
        minAmount: 0,
      })
      .orderBy('bankAccount.priority', 'ASC')
      .addOrderBy('bankAccount.lastUsedAt', 'ASC', 'NULLS FIRST');

    if (query.amount) {
      queryBuilder.andWhere('(bankAccount.limitAmount - bankAccount.withdrawnAmount) >= :amount', {
        amount: query.amount,
      });
    }

    if (query.bankId) {
      queryBuilder.andWhere('bankAccount.bankId = :bankId', { bankId: query.bankId });
    }

    const bankAccount = await queryBuilder.getOne();

    if (!bankAccount) {
      throw new NotFoundException(
        'Нет доступных реквизитов для вывода. Проверьте статус счетов или обратитесь к администратору.',
      );
    }

    return new GetAvailableBankAccountResponseDto(bankAccount);
  }
}
