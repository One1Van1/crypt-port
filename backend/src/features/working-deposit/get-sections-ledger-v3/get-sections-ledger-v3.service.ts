import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import {
  BankAccountWithdrawnOperation,
  BankAccountWithdrawnOperationType,
} from '../../../entities/bank-account-withdrawn-operation.entity';
import { FreeUsdtDistribution } from '../../../entities/free-usdt-distribution.entity';
import { FreeUsdtAdjustment } from '../../../entities/free-usdt-adjustment.entity';
import { FreeUsdtEntry } from '../../../entities/free-usdt-entry.entity';
import { Platform } from '../../../entities/platform.entity';
import { Profit } from '../../../entities/profit.entity';
import { ProfitReserve } from '../../../entities/profit-reserve.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { Transaction } from '../../../entities/transaction.entity';
import { Debt } from '../../../entities/debt.entity';
import { DebtOperation, DebtOperationType } from '../../../entities/debt-operation.entity';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import {
  AccountV2Dto,
  ConversionV2Dto,
  DeficitV2Section,
  FreeUsdtV2Section,
  PesosAccountsV2Section,
  PlatformBalanceV2Dto,
  PlatformBalancesV2Section,
  ProfitReserveV2Section,
  SummaryV2Section,
  WithdrawalV2Dto,
} from '../get-sections-ledger-v2/get-sections-ledger-v2.response.dto';
import { DebtV3Section, GetWorkingDepositSectionsLedgerV3ResponseDto } from './get-sections-ledger-v3.response.dto';

@Injectable()
export class GetWorkingDepositSectionsLedgerV3Service {
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
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(FreeUsdtEntry)
    private readonly freeUsdtEntryRepository: Repository<FreeUsdtEntry>,
    @InjectRepository(FreeUsdtDistribution)
    private readonly freeUsdtDistributionRepository: Repository<FreeUsdtDistribution>,
    @InjectRepository(FreeUsdtAdjustment)
    private readonly freeUsdtAdjustmentRepository: Repository<FreeUsdtAdjustment>,
    @InjectRepository(ProfitReserve)
    private readonly profitReserveRepository: Repository<ProfitReserve>,
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtOperation)
    private readonly debtOperationRepository: Repository<DebtOperation>,
  ) {}

  async execute(): Promise<GetWorkingDepositSectionsLedgerV3ResponseDto> {
    const platformBalances = await this.calculatePlatformBalances();
    const blockedPesos = await this.calculateBlockedPesos();
    const unpaidPesos = await this.calculateUnpaidPesos();
    const debtInfo = await this.calculateDebt();
    const freeUsdt = await this.calculateFreeUsdtNet(debtInfo.totalRepaidUsdt);
    const profitReserve = await this.calculateProfitReserve();
    const deficit = await this.calculateDeficit();

    const debt = new DebtV3Section(debtInfo);

    const totalUsdt =
      platformBalances.total +
      unpaidPesos.totalUsdt +
      freeUsdt.total +
      profitReserve.totalUsdt +
      deficit.totalUsdt +
      debt.totalUsdt;

    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    const profit = totalUsdt - initialDeposit;

    return new GetWorkingDepositSectionsLedgerV3ResponseDto({
      platformBalances,
      blockedPesos,
      unpaidPesos,
      freeUsdt,
      profitReserve,
      deficit,
      debt,
      summary: new SummaryV2Section(totalUsdt, initialDeposit, profit),
    });
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async calculateProfitReserve(): Promise<ProfitReserveV2Section> {
    const today = this.getTodayDateString();
    const reserve = await this.profitReserveRepository.findOne({ where: { date: today } });
    const totalUsdt = reserve ? Number(reserve.amountUsdt) : 0;
    return new ProfitReserveV2Section(totalUsdt);
  }

  private async calculatePlatformBalances(): Promise<PlatformBalancesV2Section> {
    const platforms = await this.platformRepository.find();
    let total = 0;

    const platformDtos = platforms.map((platform) => {
      const balance = Number(platform.balance);
      total += balance;
      return new PlatformBalanceV2Dto(platform.id, platform.name, balance, Number(platform.exchangeRate));
    });

    return new PlatformBalancesV2Section(total, platformDtos);
  }

  private async calculateBlockedPesos(): Promise<PesosAccountsV2Section> {
    // Business rule: working deposit must NOT include frozen/blocked pesos.
    return new PesosAccountsV2Section(0, 0, []);
  }

  private async calculateUnpaidPesos(): Promise<PesosAccountsV2Section> {
    const accountDtos: AccountV2Dto[] = [];

    // Business rule: "Unpaid pesos" must be sourced ONLY from bank_accounts.withdrawnAmount.
    const bankAccounts = await this.bankAccountRepository.find({ order: { id: 'ASC' } });

    let totalPesos = 0;
    let totalUsdt = 0;

    const opRepo = this.transactionRepository.manager.getRepository(BankAccountWithdrawnOperation);

    for (const account of bankAccounts) {
      const amountPesos = Number(account.withdrawnAmount) || 0;
      if (amountPesos <= 0) continue;

      totalPesos += amountPesos;

      const credits = await opRepo.find({
        where: {
          bankAccountId: account.id,
          type: BankAccountWithdrawnOperationType.CREDIT,
        },
        order: { id: 'ASC' },
      });

      let accountUsdt = 0;
      let lastPlatformId = 0;
      let lastPlatformName = '—';

      for (const c of credits) {
        const remaining = Number(c.remainingPesos ?? 0);
        const rate = Number(c.platformRate ?? 0);
        if (!Number.isFinite(remaining) || remaining <= 0) continue;
        if (!Number.isFinite(rate) || rate <= 0) continue;

        accountUsdt += remaining / rate;

        if (c.platformId) {
          lastPlatformId = Number(c.platformId);
          lastPlatformName = c.platform?.name ?? lastPlatformName;
        }
      }

      if (!Number.isFinite(accountUsdt)) accountUsdt = 0;

      totalUsdt += accountUsdt;

      const effectiveRate = accountUsdt > 0 ? amountPesos / accountUsdt : 0;
      const identifier = account.cbu ? `${account.alias} - ${account.cbu}` : account.alias;

      accountDtos.push(
        new AccountV2Dto({
          id: account.id,
          type: 'bank_account',
          identifier,
          balance: amountPesos,
          platformId: lastPlatformId,
          platformName: lastPlatformName,
          rate: effectiveRate,
          balanceUsdt: accountUsdt,
        }),
      );
    }

    return new PesosAccountsV2Section(totalPesos, totalUsdt, accountDtos);
  }

  private async calculateDebt(): Promise<{ currentDebtUsdt: number; totalRepaidUsdt: number }> {
    let debt = await this.debtRepository.findOne({ where: { key: 'global' } });
    if (!debt) {
      debt = await this.debtRepository.save(this.debtRepository.create({ key: 'global', amountUsdt: '0' }));
    }

    // Debt repayments are stored as negative deltas. Total repaid = -SUM(delta).
    const totalDeltaRaw = await this.debtOperationRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.deltaUsdt), 0)', 'sum')
      .where('o.type = :type', { type: DebtOperationType.REPAYMENT_FROM_UNPAID_PESO_EXCHANGE })
      .getRawOne<{ sum: string }>();

    const totalRepaidUsdt = -parseFloat(totalDeltaRaw?.sum ?? '0');

    return {
      currentDebtUsdt: Number(debt.amountUsdt) || 0,
      totalRepaidUsdt: Number.isFinite(totalRepaidUsdt) ? totalRepaidUsdt : 0,
    };
  }

  private async calculateFreeUsdtNet(totalDebtRepaidUsdt: number): Promise<FreeUsdtV2Section> {
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

    const totalAdjustmentsRaw = await this.freeUsdtAdjustmentRepository
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amountUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalAdjustments = parseFloat(totalAdjustmentsRaw?.sum ?? '0');

    const totalOut = totalProfitWithdrawn + totalDistributed;
    const totalWithdrawn = totalOut - totalAdjustments;

    // Debt repayments "consume" minted USDT before it becomes free.
    const total = totalEmitted - totalWithdrawn - (Number.isFinite(totalDebtRepaidUsdt) ? totalDebtRepaidUsdt : 0);

    const conversionDtos = entries.map(
      (e) =>
        new ConversionV2Dto(
          e.conversionId,
          Number(e.pesosAmount),
          Number(e.usdtAmount),
          Number(e.exchangeRate),
          e.confirmedAt,
        ),
    );

    return new FreeUsdtV2Section(total, totalEmitted, totalWithdrawn, conversionDtos);
  }

  private async calculateDeficit(): Promise<DeficitV2Section> {
    const pendingWithdrawals = await this.cashWithdrawalRepository.find({
      where: { status: CashWithdrawalStatus.PENDING },
      order: { createdAt: 'DESC' },
    });

    let totalPesos = 0;
    let totalUsdt = 0;

    const withdrawals = pendingWithdrawals.map((withdrawal) => {
      const amountPesos = Number(withdrawal.amountPesos);
      const withdrawalRate = Number(withdrawal.withdrawalRate);
      const amountUsdt = withdrawalRate > 0 ? amountPesos / withdrawalRate : 0;

      totalPesos += amountPesos;
      totalUsdt += Number.isFinite(amountUsdt) ? amountUsdt : 0;

      return new WithdrawalV2Dto({
        id: withdrawal.id,
        amountPesos,
        withdrawalRate,
        amountUsdt,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      });
    });

    return new DeficitV2Section(totalPesos, totalUsdt, withdrawals);
  }
}
