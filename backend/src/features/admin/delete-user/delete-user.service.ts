import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UserStatus } from '../../../common/enums/user.enum';
import { Shift } from '../../../entities/shift.entity';
import { ShiftStatus } from '../../../common/enums/shift.enum';

@Injectable()
export class AdminDeleteUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeShifts = await this.shiftRepository.find({
      where: {
        userId: id,
        status: ShiftStatus.ACTIVE,
      },
    });

    if (activeShifts.length > 0) {
      const endTime = new Date();

      for (const shift of activeShifts) {
        shift.endTime = endTime;
        shift.status = ShiftStatus.COMPLETED;

        const durationMs = endTime.getTime() - shift.startTime.getTime();
        shift.duration = Math.floor(durationMs / 60000);
      }

      await this.shiftRepository.save(activeShifts);
    }

    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);

    await this.userRepository.softRemove(user);
  }
}
