import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { Shift } from '../../../entities/shift.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { Platform } from '../../../entities/platform.entity';
import { User } from '../../../entities/user.entity';
import { CreateTransactionRequestDto } from './create.request.dto';
import { CreateTransactionResponseDto } from './create.response.dto';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';

@Injectable()
export class CreateTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreateTransactionRequestDto, operator: User): Promise<CreateTransactionResponseDto> {
    // 1. Проверяем активную смену оператора
    const activeShift = await this.shiftRepository.findOne({
      where: {
        user: { id: operator.id },
        status: ShiftStatus.ACTIVE,
      },
      relations: ['platform', 'operator'],
    });

    if (!activeShift) {
      throw new BadRequestException('No active shift. Please start shift first');
    }

    // 2. Проверяем платформу
    const platform = await this.platformRepository.findOne({
      where: { id: dto.platformId },
    });

    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    // 3. Начинаем транзакцию
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4. Получаем доступный банковский аккаунт с правильной сортировкой
      const query = queryRunner.manager
        .createQueryBuilder(BankAccount, 'ba')
        .leftJoinAndSelect('ba.bank', 'bank')
        .leftJoinAndSelect('ba.drop', 'drop')
        .where('ba.status = :status', { status: BankAccountStatus.WORKING })
        .andWhere('(ba.limit_amount - ba.withdrawn_amount) >= :amount', { amount: dto.amount })
        .orderBy('ba.priority', 'ASC')
        .addOrderBy('ba.last_used_at', 'ASC', 'NULLS FIRST')
        .limit(1);
      
      // Логируем SQL для отладки
      console.log('=== GET BANK ACCOUNT SQL ===');
      console.log(query.getSql());
      console.log('Parameters:', { status: BankAccountStatus.WORKING, amount: dto.amount });
      
      const bankAccounts = await query.getMany();

      if (!bankAccounts || bankAccounts.length === 0) {
        throw new BadRequestException('No available bank accounts with sufficient balance');
      }

      const bankAccount = bankAccounts[0];

      // 5. Создаем транзакцию (сразу COMPLETED, т.к. оператор вводит факт выполненной операции)
      const transaction = queryRunner.manager.create(Transaction, {
        amount: dto.amount,
        status: TransactionStatus.COMPLETED,
        comment: dto.comment,
        shift: activeShift,
        bankAccount: bankAccount,
        platform: platform,
        operator: operator,
      });

      await queryRunner.manager.save(transaction);

      // 6. Обновляем баланс банковского аккаунта
      bankAccount.withdrawnAmount = Number(bankAccount.withdrawnAmount) + dto.amount;
      bankAccount.lastUsedAt = new Date();
      
      // Auto-blocking: если достигнут лимит, блокируем счет
      const newAvailableAmount = bankAccount.limitAmount - bankAccount.withdrawnAmount;
      if (newAvailableAmount <= 0) {
        bankAccount.status = BankAccountStatus.BLOCKED;
        bankAccount.blockReason = 'Достигнут лимит вывода';
      }
      
      await queryRunner.manager.save(bankAccount);

      // 7. Обновляем статистику смены
      activeShift.operationsCount += 1;
      activeShift.totalAmount = Number(activeShift.totalAmount) + dto.amount;
      await queryRunner.manager.save(activeShift);

      await queryRunner.commitTransaction();

      // 8. Загружаем созданную транзакцию со всеми relations для DTO
      const savedTransaction = await this.transactionRepository.findOne({
        where: { id: transaction.id },
        relations: ['bankAccount', 'bankAccount.bank', 'bankAccount.drop', 'shift', 'operator'],
      });

      return new CreateTransactionResponseDto(savedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
