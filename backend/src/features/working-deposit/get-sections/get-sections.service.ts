import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { Balance } from '../../../entities/balance.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { BankAccount } from '../../../entities/bank-account.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { Profit } from '../../../entities/profit.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { Drop } from '../../../entities/drop.entity';
import { UsdtToPesoExchange } from '../../../entities/usdt-to-peso-exchange.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { Currency } from '../../../common/enums/balance.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import {
  GetWorkingDepositSectionsResponseDto,
  PlatformBalanceDto,
  AccountDto,
  ConversionDto,
  WithdrawalDto,
  PlatformBalancesSection,
  BlockedPesosSection,
  UnpaidPesosSection,
  FreeUsdtSection,
  DeficitSection,
  SummarySection,
} from './get-sections.response.dto';

@Injectable()
export class GetWorkingDepositSectionsService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly pesoToUsdtConversionRepository: Repository<PesoToUsdtConversion>,
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
  ) {}

  async execute(): Promise<GetWorkingDepositSectionsResponseDto> {
    // 1. Platform Balances - только USDT на платформах
    const platformBalances = await this.calculatePlatformBalances();

    // 2. Blocked Pesos - замороженные нео-банки
    const blockedPesos = await this.calculateBlockedPesos();

    // 3. Unpaid Pesos - активные нео-банки + деньги в транзакциях (физ банках)
    const unpaidPesos = await this.calculateUnpaidPesos();

    // 4. Free USDT - конвертированные деньги минус профит
    const freeUsdt = await this.calculateFreeUsdt();

    // 5. Deficit - pending cash withdrawals (временно выведенные деньги)
    const deficit = await this.calculateDeficit();

    // 6. Summary
    // Формула: Platform + Blocked + Unpaid + Free - Deficit
    const totalUsdt =
      platformBalances.total +
      blockedPesos.totalUsdt +
      unpaidPesos.totalUsdt +
      freeUsdt.total -
      deficit.totalUsdt;

    // Initial deposit из настроек
    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    const profit = totalUsdt - initialDeposit;

    const summary = new SummarySection(totalUsdt, initialDeposit, profit);

    return new GetWorkingDepositSectionsResponseDto(
      platformBalances,
      blockedPesos,
      unpaidPesos,
      freeUsdt,
      deficit,
      summary,
    );
  }

  private async calculatePlatformBalances(): Promise<PlatformBalancesSection> {
    const platforms = await this.platformRepository.find();
    const platformBalanceDtos: PlatformBalanceDto[] = [];

    let total = 0;

    for (const platform of platforms) {
      const balance = await this.balanceRepository
        .createQueryBuilder('balance')
        .where('balance.platform_id = :platformId', { platformId: platform.id })
        .andWhere('balance.currency = :currency', { currency: Currency.USDT })
        .getOne();

      const balanceAmount = balance ? Number(balance.amount) : 0;
      total += balanceAmount;

      platformBalanceDtos.push(
        new PlatformBalanceDto(platform.id, platform.name, balanceAmount, platform.exchangeRate),
      );
    }

    return new PlatformBalancesSection(total, platformBalanceDtos);
  }

  private async calculateBlockedPesos(): Promise<BlockedPesosSection> {
    // Замороженные нео-банки
    const frozenNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.FROZEN },
    });

    const accountDtos: AccountDto[] = [];
    let total = 0;
    let totalUsdt = 0;

    for (const neoBank of frozenNeoBanks) {
      const balance = Number(neoBank.currentBalance);
      
      // Get the latest exchange that funded this neo-bank to determine the rate
      const latestExchange = await this.usdtToPesoExchangeRepository.findOne({
        where: { neoBankId: neoBank.id },
        order: { createdAt: 'DESC' },
        relations: ['platform'],
      });

      const rate = latestExchange?.exchangeRate || 1100;
      const platformId = latestExchange?.platformId || 0;
      const platformName = latestExchange?.platform?.name || 'Unknown';
      const balanceUsdt = balance / rate;

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

    return new BlockedPesosSection(total, totalUsdt, accountDtos);
  }

  private async calculateUnpaidPesos(): Promise<UnpaidPesosSection> {
    const accountDtos: AccountDto[] = [];
    let total = 0;
    let totalUsdt = 0;

    // 1. Активные нео-банки
    const activeNeoBanks = await this.dropNeoBankRepository.find({
      where: { status: NeoBankStatus.ACTIVE },
    });

    for (const neoBank of activeNeoBanks) {
      const balance = Number(neoBank.currentBalance);
      
      const latestExchange = await this.usdtToPesoExchangeRepository.findOne({
        where: { neoBankId: neoBank.id },
        order: { createdAt: 'DESC' },
        relations: ['platform'],
      });

      const rate = latestExchange?.exchangeRate || 1100;
      const platformId = latestExchange?.platformId || 0;
      const platformName = latestExchange?.platform?.name || 'Unknown';
      const balanceUsdt = balance / rate;

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

    // 2. Pending транзакции в физических банках
    const pendingTransactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
      relations: ['bankAccount', 'platform'],
    });

    for (const transaction of pendingTransactions) {
      const amount = Number(transaction.amount);
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

    return new UnpaidPesosSection(total, totalUsdt, accountDtos);
  }

  private async calculateFreeUsdt(): Promise<FreeUsdtSection> {
    const conversions = await this.pesoToUsdtConversionRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const allConversions = await this.pesoToUsdtConversionRepository.find();
    const totalConverted = allConversions.reduce((sum, conv) => sum + Number(conv.usdtAmount), 0);

    const profits = await this.profitRepository.find();
    const totalWithdrawn = profits.reduce((sum, profit) => sum + Number(profit.withdrawnUsdt), 0);

    const total = totalConverted - totalWithdrawn;

    const conversionDtos = conversions.map(
      (conv) =>
        new ConversionDto(
          conv.id,
          conv.pesosAmount,
          conv.usdtAmount,
          conv.exchangeRate,
          conv.createdAt,
        ),
    );

    return new FreeUsdtSection(total, totalConverted, totalWithdrawn, conversionDtos);
  }

  private async calculateDeficit(): Promise<DeficitSection> {
    const pendingWithdrawals = await this.cashWithdrawalRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' },
    });

    let total = 0;
    let totalUsdt = 0;

    const withdrawalDtos = pendingWithdrawals.map((withdrawal) => {
      const amount = Number(withdrawal.amountPesos);
      const rate = Number(withdrawal.withdrawalRate);
      total += amount;
      totalUsdt += amount / rate;

      return new WithdrawalDto(
        withdrawal.id,
        amount,
        rate,
        withdrawal.status,
        withdrawal.createdAt,
      );
    });

    return new DeficitSection(total, totalUsdt, withdrawalDtos);
  }
}
