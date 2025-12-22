import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../../../entities/bank.entity';
import { GetAllBanksQueryDto } from './get-all.query.dto';
import { GetAllBanksResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllBanksService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async execute(query: GetAllBanksQueryDto): Promise<GetAllBanksResponseDto> {
    const queryBuilder = this.bankRepository.createQueryBuilder('bank');

    if (query.status) {
      queryBuilder.andWhere('bank.status = :status', { status: query.status });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(bank.name ILIKE :search OR bank.code ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    queryBuilder.orderBy('bank.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetAllBanksResponseDto(items, total);
  }
}
