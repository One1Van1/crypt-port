import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
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
    // TODO: Implement history calculation without balances table
    // Need to track platform balance changes through transactions
    const point = new WorkingDepositHistoryPointDto();
    point.date = date.toISOString().split('T')[0];
    point.totalUsdt = 0;
    point.initialDeposit = initialDeposit;
    point.profit = 0;
    point.platformBalances = 0;
    point.blockedPesos = 0;
    point.unpaidPesos = 0;
    point.freeUsdt = 0;
    point.deficit = 0;
    
    return point;
  }
}
