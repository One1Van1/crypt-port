import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { UpdateBankAccountPriorityRequestDto } from './update-priority.request.dto';
import { UpdateBankAccountPriorityResponseDto } from './update-priority.response.dto';

@Injectable()
export class UpdateBankAccountPriorityService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(
    id: string,
    dto: UpdateBankAccountPriorityRequestDto,
  ): Promise<UpdateBankAccountPriorityResponseDto> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: ['bank', 'drop'],
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    bankAccount.priority = dto.priority;
    const updatedAccount = await this.bankAccountRepository.save(bankAccount);

    return new UpdateBankAccountPriorityResponseDto(updatedAccount);
  }
}
