import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../../../entities/transaction.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { UpdateTransactionStatusRequestDto } from './update-status.request.dto';
import { UpdateTransactionStatusResponseDto } from './update-status.response.dto';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class UpdateTransactionStatusService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: number, dto: UpdateTransactionStatusRequestDto): Promise<UpdateTransactionStatusResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['bankAccount', 'shift', 'platform', 'operator', 'bankAccount.bank', 'bankAccount.drop'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Нельзя изменить статус проваленной транзакции
    if (transaction.status === TransactionStatus.FAILED) {
      throw new BadRequestException('Cannot change status of failed transaction');
    }

    // Можно изменить только COMPLETED → FAILED (отмена ошибочной операции)
    if (transaction.status === TransactionStatus.COMPLETED && dto.status !== TransactionStatus.FAILED) {
      throw new BadRequestException('Can only cancel completed transaction (change to FAILED)');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // IMPORTANT: Транзакции создаются сразу как COMPLETED (оператор фиксирует факт)
      // Этот endpoint используется только для отмены ошибочно созданных операций
      // Если помечаем транзакцию как проваленную — возвращаем баланс
      if (dto.status === TransactionStatus.FAILED && transaction.status === TransactionStatus.COMPLETED) {
        const bankAccount = await queryRunner.manager.findOne(BankAccount, {
          where: { id: transaction.bankAccount.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (bankAccount) {
          bankAccount.withdrawnAmount = Number(bankAccount.withdrawnAmount) - Number(transaction.amount);
          await queryRunner.manager.save(bankAccount);

          // Обновляем статистику смены
          if (transaction.shift) {
            transaction.shift.operationsCount = Math.max(0, transaction.shift.operationsCount - 1);
            transaction.shift.totalAmount = Math.max(0, Number(transaction.shift.totalAmount) - Number(transaction.amount));
            await queryRunner.manager.save(transaction.shift);
          }
        }
      }

      // Обновляем статус транзакции
      transaction.status = dto.status;
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      // Загружаем обновленную транзакцию
      const updatedTransaction = await this.transactionRepository.findOne({
        where: { id: transaction.id },
        relations: ['shift', 'bankAccount', 'bankAccount.bank', 'bankAccount.drop', 'platform', 'operator'],
      });

      return new UpdateTransactionStatusResponseDto(updatedTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
