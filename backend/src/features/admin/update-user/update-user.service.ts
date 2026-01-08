import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../entities/user.entity';
import { AdminUpdateUserRequestDto } from './update-user.request.dto';
import { AdminUpdateUserResponseDto } from './update-user.response.dto';

@Injectable()
export class AdminUpdateUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(userId: number, dto: AdminUpdateUserRequestDto): Promise<AdminUpdateUserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username && dto.username !== user.username) {
      const existingByUsername = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existingByUsername) {
        throw new ConflictException('Username already exists');
      }
      user.username = dto.username;
    }

    if (dto.email && dto.email !== user.email) {
      const existingByEmail = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existingByEmail) {
        throw new ConflictException('Email already exists');
      }
      user.email = dto.email;
    }

    if (dto.password) {
      if (dto.password.length < 6) {
        throw new BadRequestException('Password is too short');
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(dto.password, salt);
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }

    if (dto.telegram !== undefined) {
      user.telegram = dto.telegram;
    }

    if (dto.role) {
      user.role = dto.role;
    }

    if (dto.status) {
      user.status = dto.status;
    }

    const updated = await this.userRepository.save(user);
    return new AdminUpdateUserResponseDto(updated);
  }
}
