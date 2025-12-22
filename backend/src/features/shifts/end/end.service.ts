import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { User } from '../../../entities/user.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { EndShiftResponseDto } from './end.response.dto';

@Injectable()
export class EndShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(id: string, user: User): Promise<EndShiftResponseDto> {
    // Находим смену
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['operator', 'platform', 'transactions'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Проверяем, что это смена текущего оператора
    if (shift.operator.id !== user.id) {
      throw new ForbiddenException('You can only end your own shifts');
    }

    // Проверяем, что смена активна
    if (shift.status !== ShiftStatus.ACTIVE) {
      throw new BadRequestException('This shift is already ended');
    }

    // Завершаем смену
    const endTime = new Date();
    shift.endTime = endTime;
    shift.status = ShiftStatus.COMPLETED;

    // Рассчитываем продолжительность в минутах
    const durationMs = endTime.getTime() - shift.startTime.getTime();
    shift.duration = Math.floor(durationMs / 60000); // в минутах

    const updatedShift = await this.shiftRepository.save(shift);

    return new EndShiftResponseDto(updatedShift);
  }
}
