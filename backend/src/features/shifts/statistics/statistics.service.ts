import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { GetShiftsStatisticsQueryDto } from './statistics.query.dto';
import { GetShiftsStatisticsResponseDto } from './statistics.response.dto';

@Injectable()
export class GetShiftsStatisticsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(query: GetShiftsStatisticsQueryDto): Promise<GetShiftsStatisticsResponseDto> {
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .where('shift.status = :status', { status: ShiftStatus.COMPLETED });

    // Фильтр по пользователю
    if (query.userId) {
      queryBuilder.andWhere('shift.userId = :userId', { userId: query.userId });
    }

    // Фильтр по площадке
    if (query.platformId) {
      queryBuilder.andWhere('shift.platformId = :platformId', { platformId: query.platformId });
    }

    // Фильтр по дате
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

    const shifts = await queryBuilder.getMany();

    // Рассчитываем статистику
    const totalShifts = shifts.length;
    const totalDuration = shifts.reduce((sum, shift) => sum + (shift.duration || 0), 0);
    const totalAmount = shifts.reduce((sum, shift) => sum + Number(shift.totalAmount), 0);
    const totalOperations = shifts.reduce((sum, shift) => sum + shift.operationsCount, 0);

    const avgDuration = totalShifts > 0 ? totalDuration / totalShifts : 0;
    const avgAmount = totalShifts > 0 ? totalAmount / totalShifts : 0;
    const avgOperations = totalShifts > 0 ? totalOperations / totalShifts : 0;
    const avgAmountPerHour = totalDuration > 0 ? (totalAmount / totalDuration) * 60 : 0;

    return new GetShiftsStatisticsResponseDto({
      totalShifts,
      totalDuration,
      totalAmount,
      totalOperations,
      avgDuration,
      avgAmount,
      avgOperations,
      avgAmountPerHour,
    });
  }
}
