import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { CreatePlatformRequestDto } from './create.request.dto';
import { CreatePlatformResponseDto } from './create.response.dto';

@Injectable()
export class CreatePlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(dto: CreatePlatformRequestDto): Promise<CreatePlatformResponseDto> {
    const existingPlatform = await this.platformRepository.findOne({
      where: { name: dto.name },
    });

    if (existingPlatform) {
      throw new ConflictException('Platform with this name already exists');
    }

    const platform = this.platformRepository.create(dto);
    const savedPlatform = await this.platformRepository.save(platform);

    return new CreatePlatformResponseDto(savedPlatform);
  }
}
