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
    // Получаем доступные аккаунты с приоритетом
    const queryBuilder = this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .where('bankAccount.status = :status', { status: BankAccountStatus.WORKING })
      .andWhere('(bankAccount.limitAmount - bankAccount.withdrawnAmount) > :minAmount', {
        minAmount: 0,
      })
      // Сортировка: сначала по приоритету (выше = важнее), затем по дате последнего использования
      .orderBy('bankAccount.priority', 'DESC')
      .addOrderBy('COALESCE(bankAccount.lastUsedAt, bankAccount.createdAt)', 'ASC');

    // Фильтр по сумме (если указана)
    if (query.amount) {
      queryBuilder.andWhere('(bankAccount.limitAmount - bankAccount.withdrawnAmount) >= :amount', {
        amount: query.amount,
      });
    }

    // Фильтр по банку (если указан)
    if (query.bankId) {
      queryBuilder.andWhere('bankAccount.bankId = :bankId', { bankId: query.bankId });
    }

    // Получаем первый доступный аккаунт
    const bankAccount = await queryBuilder.getOne();

    if (!bankAccount) {
      throw new NotFoundException(
        'Нет доступных реквизитов для вывода. Проверьте статус счетов или обратитесь к администратору.',
      );
    }

    // Обновляем время последнего использования
    bankAccount.lastUsedAt = new Date();
    await this.bankAccountRepository.save(bankAccount);

    return new GetAvailableBankAccountResponseDto(bankAccount);
  }
}
