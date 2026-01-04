import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { Shift } from '../../../entities/shift.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { User } from '../../../entities/user.entity';
import { NeoBankWithdrawal } from '../../../entities/neo-bank-withdrawal.entity';
import { CreateTransactionRequestDto } from './create.request.dto';
import { CreateTransactionResponseDto } from './create.response.dto';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

@Injectable()
export class CreateTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreateTransactionRequestDto, user: User): Promise<CreateTransactionResponseDto> {
    // 1. Проверяем активную смену оператора
    const activeShift = await this.shiftRepository.findOne({
      where: {
        user: { id: user.id },
        status: ShiftStatus.ACTIVE,
      },
      relations: ['platform', 'user'],
    });

    if (!activeShift) {
      throw new BadRequestException('No active shift. Please start shift first');
    }

    // 2. Проверяем источник вывода (нео-банк дропа)
    const sourceNeoBank = await this.dropNeoBankRepository.findOne({
      where: { id: dto.sourceDropNeoBankId },
      relations: ['drop'],
    });

    if (!sourceNeoBank) {
      throw new NotFoundException('Source neo-bank not found');
    }

    if (sourceNeoBank.status !== NeoBankStatus.ACTIVE) {
      throw new BadRequestException('Source neo-bank is not active');
    }

    // 2.1. Проверяем достаточность средств на нео-банке
    if (Number(sourceNeoBank.currentBalance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance in neo-bank. Available: ${sourceNeoBank.currentBalance} ARS, required: ${dto.amount} ARS`,
      );
    }

    // 2.2. Проверяем курс платформы
    if (!activeShift.platform.exchangeRate || activeShift.platform.exchangeRate <= 0) {
      throw new BadRequestException(`Exchange rate not set for platform ${activeShift.platform.name}`);
    }

    // 2.3. Рассчитываем сумму в USDT по курсу нео-банка
    const neoBankRate = sourceNeoBank.exchangeRate || activeShift.platform.exchangeRate;
    const amountUSDT = dto.amount / neoBankRate;

    // 2.4. Проверяем баланс платформы
    if (Number(activeShift.platform.balance) < amountUSDT) {
      throw new BadRequestException(
        `Insufficient balance on platform. Available: ${activeShift.platform.balance} USDT, Required: ${amountUSDT.toFixed(4)} USDT`
      );
    }

    // 3. Начинаем транзакцию
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4. Получаем целевой банковский аккаунт (реквизит) по ID
      const bankAccount = await queryRunner.manager.findOne(BankAccount, {
        where: { id: dto.bankAccountId },
        relations: ['bank', 'drop'],
      });

      if (!bankAccount) {
        throw new NotFoundException('Bank account not found');
      }

      if (bankAccount.status !== BankAccountStatus.WORKING) {
        throw new BadRequestException('Bank account is not available');
      }

      // 4.1. Проверяем доступный лимит
      const availableLimit = Number(bankAccount.limitAmount) - Number(bankAccount.withdrawnAmount);
      if (availableLimit < dto.amount) {
        throw new BadRequestException(
          `Insufficient limit in bank account. Available: ${availableLimit} ARS, Required: ${dto.amount} ARS`,
        );
      }

      // 4.2. Вычисляем USDT по средневзвешенному курсу нео-банка
      // ВАЖНО: Используем курс НАШЕГО нео-банка, а не текущий курс платформы!
      const neoBankRate = sourceNeoBank.exchangeRate || activeShift.platform.exchangeRate;
      const calculatedUSDT = dto.amount / neoBankRate;

      // 5. Создаем транзакцию (сразу COMPLETED, т.к. оператор вводит факт выполненной операции)
      const transaction = queryRunner.manager.create(Transaction, {
        amount: dto.amount,
        amountUSDT: calculatedUSDT,
        exchangeRate: neoBankRate,  // Курс нео-банка, а не платформы!
        status: TransactionStatus.COMPLETED,
        receipt: dto.receipt,
        comment: dto.comment,
        shift: activeShift,
        platform: activeShift.platform,
        bankAccount: bankAccount,
        sourceDropNeoBank: sourceNeoBank,
        user: user,
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

      // 6.2. Вычитаем сумму из нео-банка и ПРОПОРЦИОНАЛЬНО уменьшаем USDT
      const balanceBefore = Number(sourceNeoBank.currentBalance);
      const usdtBefore = Number(sourceNeoBank.usdtEquivalent) || 0;
      
      sourceNeoBank.currentBalance = balanceBefore - dto.amount;
      
      // ВАЖНО: Вычитаем USDT пропорционально!
      // Если вывели 10% песо, то и USDT вычитаем 10%
      if (balanceBefore > 0 && usdtBefore > 0) {
        const withdrawnRatio = dto.amount / balanceBefore;
        const withdrawnUsdt = usdtBefore * withdrawnRatio;
        sourceNeoBank.usdtEquivalent = usdtBefore - withdrawnUsdt;
        
        // Пересчитываем средневзвешенный курс
        if (sourceNeoBank.currentBalance > 0) {
          sourceNeoBank.exchangeRate = sourceNeoBank.currentBalance / sourceNeoBank.usdtEquivalent;
        }
      }
      
      await queryRunner.manager.save(sourceNeoBank);

      // 6.3. Создаем запись о выводе с нео-банка
      const neoBankWithdrawal = queryRunner.manager.create(NeoBankWithdrawal, {
        amount: dto.amount,
        neoBank: sourceNeoBank,
        bankAccount: bankAccount,
        transaction: transaction,
        withdrawnByUser: user,
        balanceBefore: balanceBefore,
        balanceAfter: sourceNeoBank.currentBalance,
        comment: dto.comment,
      });
      await queryRunner.manager.save(neoBankWithdrawal);

      // 
      await queryRunner.manager.save(bankAccount);

      // 6.1. Уменьшаем баланс платформы
      activeShift.platform.balance = Number(activeShift.platform.balance) - amountUSDT;
      await queryRunner.manager.save(activeShift.platform);

      // 7. Обновляем статистику смены
      activeShift.operationsCount += 1;
      activeShift.totalAmount = Number(activeShift.totalAmount) + dto.amount;
      await queryRunner.manager.save(activeShift);

      await queryRunner.commitTransaction();

      // 8. Загружаем созданную транзакцию со всеми relations для DTO
      const savedTransaction = await this.transactionRepository.findOne({
        where: { id: transaction.id },
        relations: ['bankAccount', 'bankAccount.bank', 'bankAccount.drop', 'sourceDropNeoBank', 'sourceDropNeoBank.drop', 'platform', 'shift', 'user'],
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
