import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../../../entities/balance.entity';
import { BalanceType } from '../../../common/enums/balance.enum';
import { GetBalancesSummaryResponseDto, PlatformBalanceDto } from './summary.response.dto';

@Injectable()
export class GetBalancesSummaryService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
  ) {}

  async execute(): Promise<GetBalancesSummaryResponseDto> {
    const balances = await this.balanceRepository.find({
      relations: ['platform'],
    });

    // Группируем по площадкам
    const platformMap = new Map<number, { platformId: number; platformName: string; main: number; reserve: number }>();

    balances.forEach((balance) => {
      const platformId = balance.platform?.id;
      const platformName = balance.platform?.name || 'Unknown';

      if (!platformMap.has(platformId)) {
        platformMap.set(platformId, {
          platformId,
          platformName,
          main: 0,
          reserve: 0,
        });
      }

      const platformData = platformMap.get(platformId);
      if (balance.type === BalanceType.START_DEPOSIT) {
        platformData.main = Number(balance.amount);
      } else if (balance.type === BalanceType.PLATFORM_DEPOSIT) {
        platformData.reserve = Number(balance.amount);
      }
    });

    const platforms = Array.from(platformMap.values()).map(
      (p) => new PlatformBalanceDto(p.platformId, p.platformName, p.main, p.reserve),
    );

    // Суммарные балансы
    const totalMain = balances
      .filter((b) => b.type === BalanceType.START_DEPOSIT)
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const totalReserve = balances
      .filter((b) => b.type === BalanceType.PLATFORM_DEPOSIT)
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const totalAmount = totalMain + totalReserve;

    return new GetBalancesSummaryResponseDto(platforms, totalMain, totalReserve, totalAmount);
  }
}
