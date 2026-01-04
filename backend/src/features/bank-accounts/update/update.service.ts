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

  async execute(id: number, dto: UpdateBankAccountRequestDto): Promise<UpdateBankAccountResponseDto> {
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
    if (dto.limit !== undefined) {
      // При изменении лимита обновляем initialLimitAmount
      // и пересчитываем currentLimitAmount
      const oldInitial = Number(bankAccount.initialLimitAmount);
      const withdrawn = Number(bankAccount.withdrawnAmount);
      const oldCurrent = Number(bankAccount.currentLimitAmount);
      
      bankAccount.initialLimitAmount = dto.limit;
      // Сохраняем пропорцию: если было использовано 20%, останется 80% от нового лимита
      bankAccount.currentLimitAmount = dto.limit - withdrawn;
    }

    const updatedAccount = await this.bankAccountRepository.save(bankAccount);

    return new UpdateBankAccountResponseDto(updatedAccount);
  }
}
