import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { Profit } from '../../../entities/profit.entity';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { GetFreeUsdtLedgerQueryDto } from './get-ledger.query.dto';
import {
  FreeUsdtLedgerItemDto,
  FreeUsdtLedgerSummaryDto,
  GetFreeUsdtLedgerResponseDto,
} from './get-ledger.response.dto';

@Injectable()
export class GetFreeUsdtLedgerService {
  constructor(
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(Profit)
    private readonly profitRepository: Repository<Profit>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async execute(query: GetFreeUsdtLedgerQueryDto): Promise<GetFreeUsdtLedgerResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [items, total] = await this.conversionRepository.findAndCount({
      where: { status: ConversionStatus.CONFIRMED },
      relations: ['convertedByUser'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const confirmedSumRaw = await this.conversionRepository
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.usdtAmount), 0)', 'sum')
      .where('c.status = :status', { status: ConversionStatus.CONFIRMED })
      .getRawOne<{ sum: string }>();
    const totalConfirmedUsdt = parseFloat(confirmedSumRaw?.sum ?? '0');

    const withdrawnSumRaw = await this.profitRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.withdrawnUsdt), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    const totalWithdrawnProfitUsdt = parseFloat(withdrawnSumRaw?.sum ?? '0');

    const freeUsdt = totalConfirmedUsdt - totalWithdrawnProfitUsdt;

    const initialDepositSetting = await this.systemSettingRepository.findOne({
      where: { key: 'initial_deposit' },
    });
    const initialDeposit = initialDepositSetting ? parseFloat(initialDepositSetting.value) : 0;

    const availableProfitUsdt = Math.max(0, freeUsdt - initialDeposit);

    const dtoItems = items.map(
      (conv) =>
        new FreeUsdtLedgerItemDto(
          conv.id,
          conv.pesosAmount,
          conv.exchangeRate,
          conv.usdtAmount,
          conv.convertedByUserId,
          conv.convertedByUser?.username || 'Unknown',
          conv.createdAt,
        ),
    );

    return new GetFreeUsdtLedgerResponseDto(
      dtoItems,
      total,
      new FreeUsdtLedgerSummaryDto(
        totalConfirmedUsdt,
        totalWithdrawnProfitUsdt,
        freeUsdt,
        initialDeposit,
        availableProfitUsdt,
      ),
    );
  }
}
