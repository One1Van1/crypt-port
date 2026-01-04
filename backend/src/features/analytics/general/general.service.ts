import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Bank } from '../../../entities/bank.entity';
import { Drop } from '../../../entities/drop.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { Platform } from '../../../entities/platform.entity';
import { Shift } from '../../../entities/shift.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { UserRole } from '../../../common/enums/user.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { GetGeneralStatsResponseDto } from './general.response.dto';

@Injectable()
export class GetGeneralStatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(): Promise<GetGeneralStatsResponseDto> {
    // Пользователи
    const totalUsers = await this.userRepository.count();
    const totalOperators = await this.userRepository.count({ where: { role: UserRole.OPERATOR } });
    const totalTeamleads = await this.userRepository.count({ where: { role: UserRole.TEAMLEAD } });

    // Банки и дропы
    const totalBanks = await this.bankRepository.count();
    const totalDrops = await this.dropRepository.count();

    // Банковские аккаунты
    const totalBankAccounts = await this.bankAccountRepository.count();
    const workingBankAccounts = await this.bankAccountRepository.count({
      where: { status: BankAccountStatus.WORKING },
    });

    // Платформы
    const totalPlatforms = await this.platformRepository.count();

    // Смены
    const totalShifts = await this.shiftRepository.count();
    const activeShifts = await this.shiftRepository.count({ where: { status: ShiftStatus.ACTIVE } });

    // Транзакции
    const allTransactions = await this.transactionRepository.find();
    const totalTransactions = allTransactions.length;
    const completedTransactions = allTransactions.filter((t) => t.status === TransactionStatus.COMPLETED).length;
    const pendingTransactions = allTransactions.filter((t) => t.status === TransactionStatus.PENDING).length;
    const totalAmount = allTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const completedAmount = allTransactions
      .filter((t) => t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Балансы платформ
    const allPlatforms = await this.platformRepository.find();
    const totalBalance = allPlatforms.reduce((sum, p) => sum + Number(p.balance), 0);

    return new GetGeneralStatsResponseDto({
      totalUsers,
      totalOperators,
      totalTeamleads,
      totalBanks,
      totalDrops,
      totalBankAccounts,
      workingBankAccounts,
      totalPlatforms,
      totalShifts,
      activeShifts,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      totalAmount,
      completedAmount,
      totalBalance,
    });
  }
}
