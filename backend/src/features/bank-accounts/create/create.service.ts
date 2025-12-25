import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { Bank } from '../../../entities/bank.entity';
import { Drop } from '../../../entities/drop.entity';
import { CreateBankAccountRequestDto } from './create.request.dto';
import { CreateBankAccountResponseDto } from './create.response.dto';

@Injectable()
export class CreateBankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
  ) {}

  async execute(dto: CreateBankAccountRequestDto): Promise<CreateBankAccountResponseDto> {
    // Проверяем существование банка
    const bank = await this.bankRepository.findOne({
      where: { id: dto.bankId },
    });

    if (!bank) {
      throw new NotFoundException('Bank not found');
    }

    // Проверяем существование дропа
    const drop = await this.dropRepository.findOne({
      where: { id: dto.dropId },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    // Проверяем уникальность CBU
    const existingAccount = await this.bankAccountRepository.findOne({
      where: { cbu: dto.cbu },
    });

    if (existingAccount) {
      throw new ConflictException('Bank account with this CBU already exists');
    }

    // Создаем банковский аккаунт
    const bankAccount = this.bankAccountRepository.create({
      cbu: dto.cbu,
      alias: dto.alias,
      limitAmount: dto.limitAmount,
      priority: dto.priority || 1,
      bank,
      drop,
    });

    const savedAccount = await this.bankAccountRepository.save(bankAccount);

    // Загружаем с relations для response
    const accountWithRelations = await this.bankAccountRepository.findOne({
      where: { id: savedAccount.id },
      relations: ['bank', 'drop'],
    });

    return new CreateBankAccountResponseDto(accountWithRelations);
  }
}
