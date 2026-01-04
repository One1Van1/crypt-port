import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { GetWorkingDepositHistoryQueryDto } from './get-history.query.dto';
import { GetWorkingDepositHistoryResponseDto, WorkingDepositHistoryPointDto } from './get-history.response.dto';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class GetWorkingDepositHistoryService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async execute(query: GetWorkingDepositHistoryQueryDto): Promise<GetWorkingDepositHistoryResponseDto> {
    const days = query.days || 30;
    const history: WorkingDepositHistoryPointDto[] = [];

    // Get initial deposit setting
    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    // Generate data points for each day
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999); // End of day

      const point = await this.calculatePointAtDate(date, initialDeposit);
      history.push(point);
    }

    return new GetWorkingDepositHistoryResponseDto(history);
  }

  private async calculatePointAtDate(date: Date, initialDeposit: number): Promise<WorkingDepositHistoryPointDto> {
    // Platform balances at this date
    const balances = await this.balanceRepository.find({
      where: {
        updatedAt: LessThanOrEqual(date),
      },
      relations: ['platform'],
    });

    const platformBalances = balances.reduce((sum, b) => sum + b.amount, 0);

    // Blocked pesos (frozen neo-banks) at this date
    const frozenNeoBanks = await this.dropNeoBankRepository.find({
      where: {
        status: NeoBankStatus.FROZEN,
        updatedAt: LessThanOrEqual(date),
      },
    });

    const blockedPesos = frozenNeoBanks.reduce((sum, nb) => {
      const usdtEquivalent = nb.currentBalance / 1100; // Use default rate
      return sum + usdtEquivalent;
    }, 0);

    // Unpaid pesos (active neo-banks + pending transactions) at this date
    const activeNeoBanks = await this.dropNeoBankRepository.find({
      where: {
        status: NeoBankStatus.ACTIVE,
        createdAt: LessThanOrEqual(date),
      },
    });

    const pendingTransactions = await this.transactionRepository.find({
      where: {
        status: TransactionStatus.PENDING,
        createdAt: LessThanOrEqual(date),
      },
    });

    const unpaidPesos = 
      activeNeoBanks.reduce((sum, nb) => sum + (nb.currentBalance / 1100), 0) +
      pendingTransactions.reduce((sum, tx) => sum + (tx.amount / (tx.exchangeRate || 1100)), 0);

    // Free USDT (simplified - we don't track historical conversions)
    const freeUsdt = 0; // TODO: Add conversion history tracking

    // Deficit (simplified - we don't track historical withdrawals)
    const deficit = 0; // TODO: Add withdrawal history tracking

    const totalUsdt = platformBalances + blockedPesos + unpaidPesos + freeUsdt - deficit;
    const profit = totalUsdt - initialDeposit;

    return {
      date: date.toISOString().split('T')[0],
      totalUsdt,
      initialDeposit,
      profit,
      platformBalances,
      blockedPesos,
      unpaidPesos,
      freeUsdt,
      deficit,
    };
  }
}
