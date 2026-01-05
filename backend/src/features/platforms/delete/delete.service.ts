import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';

@Injectable()
export class DeletePlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(id: number): Promise<void> {
    const platform = await this.platformRepository.findOne({ where: { id } });

    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }

    await this.platformRepository.softRemove(platform);
  }
}
