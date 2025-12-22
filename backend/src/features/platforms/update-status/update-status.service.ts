import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { UpdatePlatformStatusRequestDto } from './update-status.request.dto';
import { UpdatePlatformStatusResponseDto } from './update-status.response.dto';

@Injectable()
export class UpdatePlatformStatusService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  async execute(id: string, dto: UpdatePlatformStatusRequestDto): Promise<UpdatePlatformStatusResponseDto> {
    const platform = await this.platformRepository.findOne({ where: { id } });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    platform.status = dto.status;
    const updatedPlatform = await this.platformRepository.save(platform);

    return new UpdatePlatformStatusResponseDto(updatedPlatform);
  }
}
