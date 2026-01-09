import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BankAccount } from '../../../entities/bank-account.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { NeoBankWithdrawal } from '../../../entities/neo-bank-withdrawal.entity';
import { Shift } from '../../../entities/shift.entity';
import { User } from '../../../entities/user.entity';
import { BankAccountStatus } from '../../../common/enums/bank-account.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';
import { ShiftStatus } from '../../../common/enums/shift.enum';
import {
  GetRequisiteV2BankAccountDto,
  GetRequisiteV2BankDto,
  GetRequisiteV2DropDto,
  GetRequisiteV2NeoBankDto,
  GetRequisiteV2PlatformDto,
  GetRequisiteV2ResponseDto,
  GetRequisiteV2ShiftDto,
} from './get-requisite-v2.response.dto';

@Injectable()
export class GetRequisiteV2Service {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(user: User): Promise<GetRequisiteV2ResponseDto> {
    const shiftRepository = this.dataSource.getRepository(Shift);

    const activeShift = await shiftRepository.findOne({
      where: {
        userId: user.id,
        status: ShiftStatus.ACTIVE,
      },
      relations: ['platform'],
    });

    if (!activeShift || !activeShift.platform) {
      throw new NotFoundException('Активная смена не найдена. Сначала откройте смену.');
    }

    const bankAccount = await this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .leftJoinAndSelect('bankAccount.bank', 'bank')
      .leftJoinAndSelect('bankAccount.drop', 'drop')
      .where('bankAccount.status = :status', { status: BankAccountStatus.WORKING })
      .andWhere('bankAccount.currentLimitAmount > :minAmount', { minAmount: 0 })
      .orderBy('bankAccount.priority', 'ASC')
      .addOrderBy('bankAccount.lastUsedAt', 'ASC', 'NULLS FIRST')
      .getOne();

    if (!bankAccount || !bankAccount.bank || !bankAccount.drop) {
      throw new NotFoundException(
        'Нет доступных реквизитов для вывода. Проверьте статус счетов или обратитесь к администратору.',
      );
    }

    const dropNeoBankRepository = this.dataSource.getRepository(DropNeoBank);

    const neoBanks = await dropNeoBankRepository.find({
      where: {
        status: NeoBankStatus.ACTIVE,
        platformId: activeShift.platformId,
      },
      order: {
        provider: 'ASC',
        accountId: 'ASC',
      },
    });

    const neoBankIds = neoBanks.map((nb) => nb.id);
    const withdrawalRepository = this.dataSource.getRepository(NeoBankWithdrawal);

    const dailyUsedByNeoBank = new Map<number, number>();
    const monthlyUsedByNeoBank = new Map<number, number>();

    if (neoBankIds.length > 0) {
      const dailyRows = await withdrawalRepository
        .createQueryBuilder('w')
        .select('w.neoBankId', 'neoBankId')
        .addSelect('COALESCE(SUM(w.amount), 0)', 'used')
        .where('w.neoBankId IN (:...ids)', { ids: neoBankIds })
        .andWhere("w.createdAt >= date_trunc('day', now())")
        .groupBy('w.neoBankId')
        .getRawMany<{ neoBankId: string; used: string }>();

      for (const row of dailyRows) {
        dailyUsedByNeoBank.set(Number(row.neoBankId), Number(row.used));
      }

      const monthlyRows = await withdrawalRepository
        .createQueryBuilder('w')
        .select('w.neoBankId', 'neoBankId')
        .addSelect('COALESCE(SUM(w.amount), 0)', 'used')
        .where('w.neoBankId IN (:...ids)', { ids: neoBankIds })
        .andWhere("w.createdAt >= date_trunc('month', now())")
        .groupBy('w.neoBankId')
        .getRawMany<{ neoBankId: string; used: string }>();

      for (const row of monthlyRows) {
        monthlyUsedByNeoBank.set(Number(row.neoBankId), Number(row.used));
      }
    }

    return new GetRequisiteV2ResponseDto({
      shift: new GetRequisiteV2ShiftDto({
        id: activeShift.id,
        platform: new GetRequisiteV2PlatformDto({
          id: activeShift.platform.id,
          name: activeShift.platform.name,
          exchangeRate: Number(activeShift.platform.exchangeRate),
        }),
      }),
      bankAccount: new GetRequisiteV2BankAccountDto({
        id: bankAccount.id,
        cbu: bankAccount.cbu,
        alias: bankAccount.alias,
        status: bankAccount.status,
        initialLimitAmount: Number(bankAccount.initialLimitAmount),
        currentLimitAmount: Number(bankAccount.currentLimitAmount),
        withdrawnAmount: Number(bankAccount.withdrawnAmount),
        bank: new GetRequisiteV2BankDto({
          id: bankAccount.bank.id,
          name: bankAccount.bank.name,
        }),
        drop: new GetRequisiteV2DropDto({
          id: bankAccount.drop.id,
          name: bankAccount.drop.name,
        }),
      }),
      neoBanks: neoBanks.map(
        (neoBank) =>
          new GetRequisiteV2NeoBankDto({
            id: neoBank.id,
            provider: neoBank.provider,
            accountId: neoBank.accountId,
            alias: neoBank.alias,
            dailyLimit:
              neoBank.dailyLimit === null
                ? null
                : Math.max(0, Number(neoBank.dailyLimit) - (dailyUsedByNeoBank.get(neoBank.id) ?? 0)),
            monthlyLimit:
              neoBank.monthlyLimit === null
                ? null
                : Math.max(0, Number(neoBank.monthlyLimit) - (monthlyUsedByNeoBank.get(neoBank.id) ?? 0)),
            dropId: neoBank.dropId,
          }),
      ),
    });
  }
}
