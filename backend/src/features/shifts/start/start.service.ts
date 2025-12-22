import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { Platform } from '../../../entities/platform.entity';
import { User } from '../../../entities/user.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { StartShiftRequestDto } from './start.request.dto';
import { StartShiftResponseDto } from './start.response.dto';

@Injectable()
export class StartShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(dto: StartShiftRequestDto, user: User): Promise<StartShiftResponseDto> {
    // Проверяем, нет ли уже активной смены у оператора
    const activeShift = await this.shiftRepository.findOne({
      where: {
        operator: { id: user.id },
        status: ShiftStatus.ACTIVE,
      },
    });

    if (activeShift) {
      throw new ConflictException('You already have an active shift. Please end it first.');
    }

    // Проверяем существование площадки
    const platform = await this.platformRepository.findOne({
      where: { id: dto.platformId },
    });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    // Создаем новую смену
    const shift = this.shiftRepository.create({
      startTime: new Date(),
      status: ShiftStatus.ACTIVE,
      operator: user,
      platform,
    });

    const savedShift = await this.shiftRepository.save(shift);

    // Загружаем с relations для response
    const shiftWithRelations = await this.shiftRepository.findOne({
      where: { id: savedShift.id },
      relations: ['operator', 'platform'],
    });

    return new StartShiftResponseDto(shiftWithRelations);
  }
}
