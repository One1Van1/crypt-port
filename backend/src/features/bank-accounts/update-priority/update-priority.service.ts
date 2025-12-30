import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { UpdateBankAccountPriorityRequestDto } from './update-priority.request.dto';
import { UpdateBankAccountPriorityResponseDto } from './update-priority.response.dto';

@Injectable()
export class UpdateBankAccountPriorityService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    id: number,
    dto: UpdateBankAccountPriorityRequestDto,
  ): Promise<UpdateBankAccountPriorityResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const bankAccountRepo = manager.getRepository(BankAccount);

      // Находим текущий аккаунт
      const bankAccount = await bankAccountRepo.findOne({
        where: { id },
        relations: ['bank', 'drop'],
      });

      if (!bankAccount) {
        throw new NotFoundException('Bank account not found');
      }

      const oldPriority = bankAccount.priority;
      let newPriority = dto.priority;

      // Получаем максимальный приоритет (количество аккаунтов)
      const maxPriority = await bankAccountRepo.count();

      // Если новый приоритет больше максимального - ставим в конец
      if (newPriority > maxPriority) {
        newPriority = maxPriority;
      }

      // Если приоритет не изменился - ничего не делаем
      if (oldPriority === newPriority) {
        return new UpdateBankAccountPriorityResponseDto(bankAccount);
      }

      // Сдвигаем приоритеты между старым и новым значением
      if (oldPriority < newPriority) {
        // Двигаемся вниз: уменьшаем приоритеты у аккаунтов между old и new
        await bankAccountRepo
          .createQueryBuilder()
          .update(BankAccount)
          .set({ priority: () => 'priority - 1' })
          .where('priority > :oldPriority', { oldPriority })
          .andWhere('priority <= :newPriority', { newPriority })
          .andWhere('id != :id', { id })
          .execute();
      } else {
        // Двигаемся вверх: увеличиваем приоритеты у аккаунтов между new и old
        await bankAccountRepo
          .createQueryBuilder()
          .update(BankAccount)
          .set({ priority: () => 'priority + 1' })
          .where('priority >= :newPriority', { newPriority })
          .andWhere('priority < :oldPriority', { oldPriority })
          .andWhere('id != :id', { id })
          .execute();
      }

      // Устанавливаем новый приоритет для текущего аккаунта
      bankAccount.priority = newPriority;
      const updatedAccount = await bankAccountRepo.save(bankAccount);

      // Нормализуем приоритеты (убираем разрывы)
      await this.normalizePriorities(bankAccountRepo);

      // Возвращаем обновленный аккаунт с relations
      const result = await bankAccountRepo.findOne({
        where: { id },
        relations: ['bank', 'drop'],
      });

      return new UpdateBankAccountPriorityResponseDto(result);
    });
  }

  /**
   * Нормализация приоритетов - убираем разрывы, начинаем с 1
   */
  private async normalizePriorities(bankAccountRepo: Repository<BankAccount>): Promise<void> {
    const accounts = await bankAccountRepo.find({
      order: { priority: 'ASC', createdAt: 'ASC' },
    });

    let currentPriority = 1;
    for (const account of accounts) {
      if (account.priority !== currentPriority) {
        account.priority = currentPriority;
        await bankAccountRepo.save(account);
      }
      currentPriority++;
    }
  }
}
