import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { UpdateWithdrawnAmountRequestDto } from './update-withdrawn-amount.request.dto';
import { UpdateWithdrawnAmountResponseDto } from './update-withdrawn-amount.response.dto';

@Injectable()
export class UpdateWithdrawnAmountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(
    id: number,
    dto: UpdateWithdrawnAmountRequestDto,
  ): Promise<UpdateWithdrawnAmountResponseDto> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: ['bank', 'drop'],
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    const initial = Number(bankAccount.initialLimitAmount);
    const nextWithdrawn = Number(dto.withdrawnAmount);

    if (!Number.isFinite(nextWithdrawn)) {
      throw new BadRequestException('withdrawnAmount must be a number');
    }

    if (nextWithdrawn < 0) {
      throw new BadRequestException('withdrawnAmount must be >= 0');
    }

    if (Number.isFinite(initial) && nextWithdrawn > initial) {
      throw new BadRequestException('withdrawnAmount cannot exceed initialLimitAmount');
    }

    bankAccount.withdrawnAmount = nextWithdrawn;
    bankAccount.currentLimitAmount = initial - nextWithdrawn;

    const saved = await this.bankAccountRepository.save(bankAccount);
    return new UpdateWithdrawnAmountResponseDto(saved);
  }
}
