import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { User } from '../../../entities/user.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { GetMyCurrentShiftResponseDto } from './get-my-current.response.dto';

@Injectable()
export class GetMyCurrentShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(user: User): Promise<GetMyCurrentShiftResponseDto | null> {
    const activeShift = await this.shiftRepository.findOne({
      where: {
        user: { id: user.id },
        status: ShiftStatus.ACTIVE,
      },
      relations: ['platform', 'user'],
    });

    if (!activeShift) {
      return null;
    }

    return new GetMyCurrentShiftResponseDto(activeShift);
  }
}
