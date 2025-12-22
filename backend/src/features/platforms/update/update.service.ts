import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { UpdatePlatformRequestDto } from './update.request.dto';
import { UpdatePlatformResponseDto } from './update.response.dto';

@Injectable()
export class UpdatePlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(id: string, dto: UpdatePlatformRequestDto): Promise<UpdatePlatformResponseDto> {
    const platform = await this.platformRepository.findOne({ where: { id } });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    if (dto.name && dto.name !== platform.name) {
      const existingPlatform = await this.platformRepository.findOne({
        where: { name: dto.name },
      });

      if (existingPlatform) {
        throw new ConflictException('Platform with this name already exists');
      }
    }

    Object.assign(platform, dto);
    const updatedPlatform = await this.platformRepository.save(platform);

    return new UpdatePlatformResponseDto(updatedPlatform);
  }
}
