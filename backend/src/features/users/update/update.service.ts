import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UpdateUserRequestDto } from './update.request.dto';
import { UpdateUserResponseDto } from './update.response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(id: string, dto: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Если меняется username — проверяем уникальность
    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: dto.username },
      });

      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }

      user.username = dto.username;
    }

    // Если меняется пароль
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(dto.password, salt);
    }

    const updatedUser = await this.userRepository.save(user);

    return new UpdateUserResponseDto(updatedUser);
  }
}
