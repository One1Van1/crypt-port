import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { UpdateBankAccountStatusRequestDto } from './update-status.request.dto';
import { UpdateBankAccountStatusResponseDto } from './update-status.response.dto';

@Injectable()
export class UpdateBankAccountStatusService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(
    id: string,
    dto: UpdateBankAccountStatusRequestDto,
  ): Promise<UpdateBankAccountStatusResponseDto> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: ['bank', 'drop'],
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    bankAccount.status = dto.status;
    const updatedAccount = await this.bankAccountRepository.save(bankAccount);

    return new UpdateBankAccountStatusResponseDto(updatedAccount);
  }
}
