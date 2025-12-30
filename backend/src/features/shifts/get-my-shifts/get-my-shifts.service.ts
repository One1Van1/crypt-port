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
    console.log('🔍 GetMyShiftsService.execute called');
    console.log('👤 User:', { id: user.id, username: user.username, role: user.role });
    
    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.operator', 'operator')
      .leftJoinAndSelect('shift.platform', 'platform')
      .where('shift.operatorId = :operatorId', { operatorId: user.id })
      .orderBy('shift.startTime', 'DESC');

    console.log('📝 SQL:', queryBuilder.getSql());
    console.log('📊 Parameters:', queryBuilder.getParameters());

    const [items, total] = await queryBuilder.getManyAndCount();

    console.log('✅ Found items:', items.length, 'Total:', total);
    console.log('📋 Items operators:', items.map(s => ({ 
      shiftId: s.id, 
      operatorId: s.operatorId, 
      operatorName: s.operator?.username 
    })));

    return new GetMyShiftsResponseDto(items, total);
  }
}
