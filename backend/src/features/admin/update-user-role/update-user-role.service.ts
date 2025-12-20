import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UpdateUserRoleRequestDto } from './update-user-role.request.dto';
import { UpdateUserRoleResponseDto } from './update-user-role.response.dto';

@Injectable()
export class UpdateUserRoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(userId: string, dto: UpdateUserRoleRequestDto): Promise<UpdateUserRoleResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = dto.role;
    await this.userRepository.save(user);

    return new UpdateUserRoleResponseDto(user);
  }
}
