import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { GetAllBankAccountsQueryDto } from './get-all.query.dto';
import { GetAllBankAccountsResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllBankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(query: GetAllBankAccountsQueryDto): Promise<GetAllBankAccountsResponseDto> {
    const queryBuilder = this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop');

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('bankAccount.status = :status', { status: query.status });
    }

    // Фильтр по банку
    if (query.bankId) {
      queryBuilder.andWhere('bankAccount.bankId = :bankId', { bankId: query.bankId });
    }

    // Фильтр по дропу
    if (query.dropId) {
      queryBuilder.andWhere('bankAccount.dropId = :dropId', { dropId: query.dropId });
    }

    // Поиск по CBU или alias
    if (query.search) {
      queryBuilder.andWhere(
        '(bankAccount.cbu ILIKE :search OR bankAccount.alias ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Сортировка по приоритету, затем по дате создания
    queryBuilder.orderBy('bankAccount.priority', 'ASC');
    queryBuilder.addOrderBy('bankAccount.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetAllBankAccountsResponseDto(items, total);
  }
}
