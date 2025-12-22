import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drop } from '../../../entities/drop.entity';
import { GetAllDropsQueryDto } from './get-all.query.dto';
import { GetAllDropsResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllDropsService {
  constructor(
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(query: GetAllDropsQueryDto): Promise<GetAllDropsResponseDto> {
    const queryBuilder = this.dropRepository.createQueryBuilder('drop');

    if (query.status) {
      queryBuilder.andWhere('drop.status = :status', { status: query.status });
    }

    if (query.search) {
      queryBuilder.andWhere('drop.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    queryBuilder.orderBy('drop.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetAllDropsResponseDto(items, total);
  }
}
