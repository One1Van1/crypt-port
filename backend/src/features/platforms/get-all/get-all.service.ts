import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { GetAllPlatformsQueryDto } from './get-all.query.dto';
import { GetAllPlatformsResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllPlatformsService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(query: GetAllPlatformsQueryDto): Promise<GetAllPlatformsResponseDto> {
    const queryBuilder = this.platformRepository.createQueryBuilder('platform');

    if (query.status) {
      queryBuilder.andWhere('platform.status = :status', { status: query.status });
    }

    if (query.search) {
      queryBuilder.andWhere('platform.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    queryBuilder.orderBy('platform.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetAllPlatformsResponseDto(items, total);
  }
}
