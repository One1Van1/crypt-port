import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { BlockBankAccountRequestDto } from './block.request.dto';
import { BlockBankAccountResponseDto } from './block.response.dto';

@Injectable()
export class BlockBankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(id: number, dto: BlockBankAccountRequestDto): Promise<BlockBankAccountResponseDto> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: ['bank', 'drop'],
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    // Блокируем аккаунт
    bankAccount.status = BankAccountStatus.BLOCKED;
    bankAccount.blockReason = dto.reason;

    const updatedAccount = await this.bankAccountRepository.save(bankAccount);

    return new BlockBankAccountResponseDto(updatedAccount);
  }
}
