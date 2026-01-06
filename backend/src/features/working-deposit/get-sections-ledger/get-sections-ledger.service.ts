import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { Drop } from '../../../entities/drop.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { Platform } from '../../../entities/platform.entity';
import { Profit } from '../../../entities/profit.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { UsdtToPesoExchange } from '../../../entities/usdt-to-peso-exchange.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import {
  AccountDto,
  BlockedPesosSection,
  ConversionDto,
  DeficitSection,
  FreeUsdtSection,
  GetWorkingDepositSectionsLedgerResponseDto,
  PlatformBalanceDto,
  PlatformBalancesSection,
  SummarySection,
  UnpaidPesosSection,
  WithdrawalDto,
} from './get-sections-ledger.response.dto';

@Injectable()
export class GetWorkingDepositSectionsLedgerService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(Drop)
    private readonly dropRepository: Repository<Drop>,
    @InjectRepository(UsdtToPesoExchange)
    private readonly usdtToPesoExchangeRepository: Repository<UsdtToPesoExchange>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(FreeUsdtEntry)
    private readonly freeUsdtEntryRepository: Repository<FreeUsdtEntry>,
    @InjectRepository(FreeUsdtDistribution)
    private readonly freeUsdtDistributionRepository: Repository<FreeUsdtDistribution>,
  ) {}

  async execute(): Promise<GetWorkingDepositSectionsLedgerResponseDto> {
    const platformBalances = await this.calculatePlatformBalances();
    const blockedPesos = await this.calculateBlockedPesos();
    const unpaidPesos = await this.calculateUnpaidPesos();
    const freeUsdt = await this.calculateFreeUsdt();
    const deficit = await this.calculateDeficit();

    const totalUsdt =
      platformBalances.total +
      blockedPesos.totalUsdt +
      unpaidPesos.totalUsdt +
      freeUsdt.total -
      deficit.totalUsdt;

    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    const profit = totalUsdt - initialDeposit;

    return new GetWorkingDepositSectionsLedgerResponseDto(
      platformBalances,
      blockedPesos,
      unpaidPesos,
      freeUsdt,
      deficit,
      new SummarySection(totalUsdt, initialDeposit, profit),
    );
  }

  private async calculatePlatformBalances(): Promise<PlatformBalancesSection> {
    const platforms = await this.platformRepository.find();
    let total = 0;

    const platformDtos = platforms.map((platform) => {
      const balanceAmount = Number(platform.balance);
      total += balanceAmount;
      return new PlatformBalanceDto(platform.id, platform.name, balanceAmount, platform.exchangeRate);
    });

    return new PlatformBalancesSection(total, platformDtos);
  }

  private async calculateBlockedPesos(): Promise<BlockedPesosSection> {
    const frozenNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.FROZEN },
      relations: ['platform'],
    });

    const accountDtos: AccountDto[] = [];
    let total = 0;
    let totalUsdt = 0;

    for (const neoBank of frozenNeoBanks) {
      const balance = Number(neoBank.currentBalance);
      const rate = neoBank.exchangeRate || 1100;
      const balanceUsdt = Number(neoBank.usdtEquivalent) || balance / rate;

      const platform = neoBank.platform;
      const platformId = platform?.id || 0;
      const platformName = platform?.name || 'Unknown';

      total += balance;
      totalUsdt += Number(balanceUsdt);

      accountDtos.push(
        new AccountDto(
          neoBank.id,
          'neo_bank',
          neoBank.provider,
          balance,
          platformId,
          platformName,
          rate,
        ),
      );
    }

    return new BlockedPesosSection(total, totalUsdt, accountDtos);
  }

  private async calculateUnpaidPesos(): Promise<UnpaidPesosSection> {
    const accountDtos: AccountDto[] = [];
    let total = 0;
    let totalUsdt = 0;

    const activeNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.ACTIVE },
      relations: ['platform'],
    });

    for (const neoBank of activeNeoBanks) {
      const balance = Number(neoBank.currentBalance) || 0;
      const rate = Number(neoBank.exchangeRate) || 1100;
      const balanceUsdt = Number(neoBank.usdtEquivalent) || balance / rate;

      const platform = neoBank.platform;
      const platformId = platform?.id || 0;
      const platformName = platform?.name || 'Unknown';

      total += balance;
      totalUsdt += balanceUsdt;

      accountDtos.push(
        new AccountDto(
          neoBank.id,
          'neo_bank',
          neoBank.provider,
          balance,
          platformId,
          platformName,
          rate,
        ),
      );
    }

    const pendingTransactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
      relations: ['bankAccount', 'platform'],
    });

    for (const transaction of pendingTransactions) {
      const amount = Number(transaction.amount) || 0;
      const rate = Number(transaction.exchangeRate) || 1100;
      const amountUsdt = amount / rate;

      total += amount;
      totalUsdt += amountUsdt;

      accountDtos.push(
        new AccountDto(
          transaction.id,
          'bank_account',
          transaction.bankAccount?.alias || 'Unknown',
          amount,
          transaction.platformId || 0,
          transaction.platform?.name || 'Unknown',
          rate,
        ),
      );
    }

    if (isNaN(totalUsdt)) {
      totalUsdt = 0;
    }

    return new UnpaidPesosSection(total, totalUsdt, accountDtos);
  }

  private async calculateFreeUsdt(): Promise<FreeUsdtSection> {
    const entries = await this.freeUsdtEntryRepository.find({
      order: { confirmedAt: 'DESC' },
      take: 50,
    });

    const totalEmittedRaw = await this.freeUsdtEntryRepository
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.usdtAmount), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalEmitted = parseFloat(totalEmittedRaw?.sum ?? '0');

    const totalProfitWithdrawnRaw = await this.profitRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalProfitWithdrawn = parseFloat(totalProfitWithdrawnRaw?.sum ?? '0');

    const totalDistributedRaw = await this.freeUsdtDistributionRepository
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.amountUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalDistributed = parseFloat(totalDistributedRaw?.sum ?? '0');

    const totalOut = totalProfitWithdrawn + totalDistributed;
    const total = totalEmitted - totalOut;

    const conversionDtos = entries.map(
      (e) =>
        new ConversionDto(
          e.conversionId,
          Number(e.pesosAmount),
          Number(e.usdtAmount),
          Number(e.exchangeRate),
          e.confirmedAt,
        ),
    );

    return new FreeUsdtSection(total, totalEmitted, totalOut, conversionDtos);
  }

  private async calculateDeficit(): Promise<DeficitSection> {
    const pendingWithdrawals = await this.cashWithdrawalRepository.find({
      where: { status: CashWithdrawalStatus.PENDING },
      order: { createdAt: 'DESC' },
    });

    let total = 0;
    let totalUsdt = 0;

    const withdrawalDtos = pendingWithdrawals.map((withdrawal) => {
      const amount = Number(withdrawal.amountPesos);
      const rate = Number(withdrawal.withdrawalRate);
      total += amount;
      totalUsdt += amount / rate;

      return new WithdrawalDto(withdrawal.id, amount, rate, withdrawal.status, withdrawal.createdAt);
    });

    return new DeficitSection(total, totalUsdt, withdrawalDtos);
  }
}
