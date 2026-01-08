import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { User } from '../../../entities/user.entity';
import { GetMyShiftsResponseDto } from './get-my-shifts.response.dto'; 

@Injectable()
export class GetMyShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(user: User): Promise<GetMyShiftsResponseDto> {

    
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .withDeleted()
      .leftJoinAndSelect('shift.user', 'user')
      .leftJoinAndSelect('shift.platform', 'platform')
      .where('shift.userId = :userId', { userId: user.id })
      .andWhere('shift.deletedAt IS NULL')
      .orderBy('shift.startTime', 'DESC');



    const [items, total] = await queryBuilder.getManyAndCount();


    return new GetMyShiftsResponseDto(items, total);
  }
}
