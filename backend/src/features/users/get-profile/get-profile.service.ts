import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';
import { GetUserProfileResponseDto } from './get-profile.response.dto';

@Injectable()
export class GetUserProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(currentUser: User, targetUserId: number): Promise<GetUserProfileResponseDto> {
    const canReadAny = [UserRole.ADMIN, UserRole.TEAMLEAD].includes(currentUser.role);
    const canReadSelf = currentUser.id === targetUserId;

    if (!canReadAny && !canReadSelf) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new GetUserProfileResponseDto(user);
  }
}
