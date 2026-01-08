import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../../entities/shift.entity';
import { GetShiftByIdResponseDto } from './get-by-id.response.dto';

@Injectable()
export class GetShiftByIdService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async execute(id: number): Promise<GetShiftByIdResponseDto> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['user', 'platform', 'transactions', 'transactions.bankAccount', 'transactions.bankAccount.bank'],
      withDeleted: true,
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return new GetShiftByIdResponseDto(shift);
  }
}
