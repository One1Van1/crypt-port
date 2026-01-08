import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { GetAllShiftsQueryDto } from './get-all.query.dto';
import { GetAllShiftsResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(query: GetAllShiftsQueryDto): Promise<GetAllShiftsResponseDto> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .withDeleted()
      .leftJoinAndSelect('shift.user', 'user')
      .leftJoinAndSelect('shift.platform', 'platform')
      .where('shift.deletedAt IS NULL');

    // Фильтр по статусу
    if (query.status) {
      queryBuilder.andWhere('shift.status = :status', { status: query.status });
    }

    // Фильтр по пользователю
    if (query.userId) {
      queryBuilder.andWhere('shift.userId = :userId', { userId: query.userId });
    }

    // Фильтр по площадке
    if (query.platformId) {
      queryBuilder.andWhere('shift.platformId = :platformId', { platformId: query.platformId });
    }

    // Фильтр по дате начала
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('shift.startTime BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('shift.startTime >= :startDate', { startDate: query.startDate });
    } else if (query.endDate) {
      queryBuilder.andWhere('shift.startTime <= :endDate', { endDate: query.endDate });
    }

    // Сортировка по дате начала (новые сверху)
    queryBuilder.orderBy('shift.startTime', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetAllShiftsResponseDto(items, total);
  }
}
