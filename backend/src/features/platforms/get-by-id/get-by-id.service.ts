import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { GetPlatformByIdResponseDto } from './get-by-id.response.dto';

@Injectable()
export class GetPlatformByIdService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(id: number): Promise<GetPlatformByIdResponseDto> {
    const platform = await this.platformRepository.findOne({ where: { id } });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    return new GetPlatformByIdResponseDto(platform);
  }
}
