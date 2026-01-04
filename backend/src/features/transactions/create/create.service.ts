import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { Shift } from '../../../entities/shift.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Balance } from '../../../entities/balance.entity';
import { User } from '../../../entities/user.entity';
import { ExchangeRate } from '../../../entities/exchange-rate.entity';
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
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
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

    // 2.1. Получаем текущий курс
    const currentRate = await this.exchangeRateRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!currentRate) {
      throw new BadRequestException('No active exchange rate found. Please set exchange rate first.');
    }

    // 2.2. Рассчитываем сумму в USDT
    const amountUSDT = dto.amount / currentRate.rate;

    // 2.3. Проверяем Balance платформы
    const balance = await this.balanceRepository.findOne({
      where: { platform: { id: activeShift.platform.id } },
      relations: ['platform'],
    });

    if (!balance) {
      throw new NotFoundException(`Balance not found for platform ${activeShift.platform.name}`);
    }

    if (balance.amount < amountUSDT) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${balance.amount} USDT, required: ${amountUSDT.toFixed(4)} USDT`,
      );
    }

    // 3. Начинаем транзакцию
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4. Получаем доступный банковский аккаунт того же дропа с правильной сортировкой
      const query = queryRunner.manager
        .createQueryBuilder(BankAccount, 'ba')
        .leftJoinAndSelect('ba.bank', 'bank')
        .leftJoinAndSelect('ba.drop', 'drop')
        .where('ba.status = :status', { status: BankAccountStatus.WORKING })
        .andWhere('ba.drop_id = :dropId', { dropId: sourceNeoBank.drop.id })
        .andWhere('(ba.limit_amount - ba.withdrawn_amount) >= :amount', { amount: dto.amount })
        .orderBy('ba.priority', 'ASC')
        .addOrderBy('ba.last_used_at', 'ASC', 'NULLS FIRST')
        .limit(1);
      
      // Логируем SQL для отладки
      console.log('=== GET BANK ACCOUNT SQL ===');
      console.log(query.getSql());
      console.log('Parameters:', { 
        status: BankAccountStatus.WORKING, 
        dropId: sourceNeoBank.drop.id,
        amount: dto.amount 
      });
      
      const bankAccounts = await query.getMany();

      if (!bankAccounts || bankAccounts.length === 0) {
        throw new BadRequestException('No available bank accounts with sufficient balance for this drop');
      }

      const bankAccount = bankAccounts[0];

      // 5. Создаем транзакцию (сразу COMPLETED, т.к. оператор вводит факт выполненной операции)
      const transaction = queryRunner.manager.create(Transaction, {
        amount: dto.amount,
        amountUSDT: amountUSDT,
        exchangeRate: currentRate.rate,
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

      // 6.1. Уменьшаем Balance платформы
      balance.amount = Number(balance.amount) - amountUSDT;
      await queryRunner.manager.save(balance);

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
