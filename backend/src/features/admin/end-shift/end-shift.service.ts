import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { AdminEndShiftResponseDto } from './end-shift.response.dto';

@Injectable()
export class AdminEndShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(id: number): Promise<AdminEndShiftResponseDto> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['user', 'platform', 'transactions'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== ShiftStatus.ACTIVE) {
      throw new BadRequestException('This shift is already ended');
    }

    const endTime = new Date();
    shift.endTime = endTime;
    shift.status = ShiftStatus.COMPLETED;

    const durationMs = endTime.getTime() - shift.startTime.getTime();
    shift.duration = Math.floor(durationMs / 60000);

    const updatedShift = await this.shiftRepository.save(shift);

    const shiftWithRelations = await this.shiftRepository.findOne({
      where: { id: updatedShift.id },
      relations: ['user', 'platform', 'transactions'],
    });

    return new AdminEndShiftResponseDto(shiftWithRelations);
  }
}
