import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drop } from '../../../entities/drop.entity';
import { UpdateDropStatusRequestDto } from './update-status.request.dto';
import { UpdateDropStatusResponseDto } from './update-status.response.dto';

@Injectable()
export class UpdateDropStatusService {
  constructor(
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(id: string, dto: UpdateDropStatusRequestDto): Promise<UpdateDropStatusResponseDto> {
    const drop = await this.dropRepository.findOne({ where: { id } });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    drop.status = dto.status;
    const updatedDrop = await this.dropRepository.save(drop);

    return new UpdateDropStatusResponseDto(updatedDrop);
  }
}
