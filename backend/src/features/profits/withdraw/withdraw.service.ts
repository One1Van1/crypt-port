import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Profit } from '../../../entities/profit.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { Balance } from '../../../entities/balance.entity';
import { User } from '../../../entities/user.entity';
import { WithdrawProfitRequestDto } from './withdraw.request.dto';
import { WithdrawProfitResponseDto } from './withdraw.response.dto';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { Currency } from '../../../common/enums/balance.enum';

@Injectable()
export class WithdrawProfitService {
  constructor(
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly pesoToUsdtConversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: WithdrawProfitRequestDto, user: User): Promise<WithdrawProfitResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Рассчитываем доступный профит (только свободные USDT минус депозит)
      const availableProfit = await this.calculateAvailableProfit();

      if (availableProfit <= 0) {
        throw new BadRequestException('No profit available to withdraw');
      }

      if (dto.profitUsdtAmount > availableProfit) {
        throw new BadRequestException(
          `Cannot withdraw ${dto.profitUsdtAmount} USDT. Available profit: ${availableProfit.toFixed(2)} USDT`
        );
      }

      // 2. Рассчитываем суммы
      // Профит выводится по своему курсу админа, основная сумма по курсу платформы не важна
      // т.к. профит = свободные USDT - депозит (уже в USDT)
      const totalPesosReceived = dto.profitUsdtAmount * dto.adminRate;

      // 3. Списываем USDT из "свободных USDT"
      await this.deductFreeUsdt(queryRunner, dto.profitUsdtAmount);

      // 4. Возвращаем основную сумму в выбранную секцию (в песо по курсу админа)
      const returnedAmountPesos = dto.profitUsdtAmount * dto.adminRate;
      
      if (dto.returnedToSection === 'blocked_pesos') {
        // Находим первый замороженный нео-банк и добавляем туда
        const frozenNeoBank = await queryRunner.manager.findOne(DropNeoBank, {
          where: { status: NeoBankStatus.FROZEN },
          order: { id: 'ASC' },
        });

        if (!frozenNeoBank) {
          throw new BadRequestException('No frozen neo-banks found to return principal amount');
        }

        frozenNeoBank.currentBalance = Number(frozenNeoBank.currentBalance) + returnedAmountPesos;
        await queryRunner.manager.save(DropNeoBank, frozenNeoBank);
      } else {
        // unpaid_pesos - добавляем в активные нео-банки
        const activeNeoBank = await queryRunner.manager.findOne(DropNeoBank, {
          where: { status: NeoBankStatus.ACTIVE },
          order: { id: 'ASC' },
        });

        if (!activeNeoBank) {
          throw new BadRequestException('No active neo-banks found to return principal amount');
        }

        activeNeoBank.currentBalance = Number(activeNeoBank.currentBalance) + returnedAmountPesos;
        await queryRunner.manager.save(DropNeoBank, activeNeoBank);
      }

      // 5. Создаем запись о выводе профита
      const profit = queryRunner.manager.create(Profit, {
        withdrawnUsdt: dto.profitUsdtAmount,
        adminRate: dto.adminRate,
        profitPesos: totalPesosReceived,
        returnedToSection: dto.returnedToSection,
        returnedAmountPesos: returnedAmountPesos,
        createdByUserId: user.id,
      });

      const savedProfit = await queryRunner.manager.save(Profit, profit);

      await queryRunner.commitTransaction();

      return new WithdrawProfitResponseDto(
        savedProfit.id,
        dto.profitUsdtAmount,
        dto.adminRate,
        0,
        totalPesosReceived,
        totalPesosReceived,
        returnedAmountPesos,
        dto.returnedToSection,
        user.id,
        savedProfit.createdAt,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async calculateAvailableProfit(): Promise<number> {
    // Профит = Свободные USDT - Изначальный депозит
    // Свободные USDT = все конвертации - выведенные профиты
    
    const conversions = await this.pesoToUsdtConversionRepository.find();
    const totalConvertedUsdt = conversions.reduce(
      (sum, conv) => sum + Number(conv.usdtAmount),
      0
    );

    const withdrawnProfits = await this.profitRepository.find();
    const totalWithdrawnUsdt = withdrawnProfits.reduce(
      (sum, profit) => sum + Number(profit.withdrawnUsdt),
      0
    );

    const freeUsdt = totalConvertedUsdt - totalWithdrawnUsdt;

    // TODO: Изначальный депозит нужно хранить в настройках системы
    // Пока считаем что это сумма балансов платформ
    const platformBalances = await this.balanceRepository
      .createQueryBuilder('balance')
      .where('balance.currency = :currency', { currency: Currency.USDT })
      .getMany();

    const initialDeposit = platformBalances.reduce(
      (sum, balance) => sum + Number(balance.amount),
      0
    );

    const availableProfit = freeUsdt - initialDeposit;

    return Math.max(0, availableProfit);
  }

  private async deductFreeUsdt(queryRunner: any, amount: number): Promise<void> {
    // Списываем из свободных USDT путём "виртуального" уменьшения
    // (т.к. свободные USDT = conversions - withdrawn profits, мы просто создаём запись о выводе)
    // Реальное списание происходит через создание записи Profit
    
    // Проверяем что достаточно свободных USDT
    const conversions = await this.pesoToUsdtConversionRepository.find();
    const totalConvertedUsdt = conversions.reduce(
      (sum, conv) => sum + Number(conv.usdtAmount),
      0
    );

    const withdrawnProfits = await this.profitRepository.find();
    const totalWithdrawnUsdt = withdrawnProfits.reduce(
      (sum, profit) => sum + Number(profit.withdrawnUsdt),
      0
    );

    const freeUsdt = totalConvertedUsdt - totalWithdrawnUsdt;

    if (freeUsdt < amount) {
      throw new BadRequestException(
        `Insufficient free USDT. Available: ${freeUsdt.toFixed(2)} USDT, Required: ${amount} USDT`
      );
    }
  }
}
