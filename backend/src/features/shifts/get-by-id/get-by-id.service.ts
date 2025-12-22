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

  async execute(id: string): Promise<GetShiftByIdResponseDto> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['operator', 'platform', 'transactions', 'transactions.bankAccount', 'transactions.bankAccount.bank'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return new GetShiftByIdResponseDto(shift);
  }
}
