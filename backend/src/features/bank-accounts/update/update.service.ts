import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { UpdateBankAccountRequestDto } from './update.request.dto';
import { UpdateBankAccountResponseDto } from './update.response.dto';

@Injectable()
export class UpdateBankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async execute(id: string, dto: UpdateBankAccountRequestDto): Promise<UpdateBankAccountResponseDto> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: ['bank', 'drop'],
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    // Если обновляется alias, проверяем его длину
    if (dto.alias !== undefined && dto.alias.length < 6) {
      throw new ConflictException('Alias must be at least 6 characters');
    }

    // Обновляем только переданные поля
    if (dto.alias !== undefined) bankAccount.alias = dto.alias;
    if (dto.limit !== undefined) bankAccount.limit = dto.limit;

    const updatedAccount = await this.bankAccountRepository.save(bankAccount);

    return new UpdateBankAccountResponseDto(updatedAccount);
  }
}
