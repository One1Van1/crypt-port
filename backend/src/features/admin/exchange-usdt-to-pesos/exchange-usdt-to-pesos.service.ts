import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Platform } from '../../../entities/platform.entity';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { UsdtToPesoExchange } from '../../../entities/usdt-to-peso-exchange.entity';
import { User } from '../../../entities/user.entity';
import { ExchangeUsdtToPesosRequestDto } from './exchange-usdt-to-pesos.request.dto';
import { ExchangeUsdtToPesosResponseDto } from './exchange-usdt-to-pesos.response.dto';

import { PlatformStatus } from '../../../common/enums/platform.enum';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

@Injectable()
export class ExchangeUsdtToPesosService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
    @InjectRepository(UsdtToPesoExchange)
    private readonly usdtToPesoExchangeRepository: Repository<UsdtToPesoExchange>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: ExchangeUsdtToPesosRequestDto, user: User): Promise<ExchangeUsdtToPesosResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Проверяем существование и статус платформы
      const platform = await queryRunner.manager.findOne(Platform, {
        where: { id: dto.platformId },
      });

      if (!platform) {
        throw new NotFoundException(`Platform with ID ${dto.platformId} not found`);
      }

      if (platform.status !== PlatformStatus.ACTIVE) {
        throw new BadRequestException(`Platform ${platform.name} is not active`);
      }

      // Проверяем курс платформы
      if (!platform.exchangeRate || platform.exchangeRate <= 0) {
        throw new BadRequestException(`Exchange rate not set for platform ${platform.name}`);
      }

      // 2. Проверяем существование и статус нео-банка
      const neoBank = await queryRunner.manager.findOne(DropNeoBank, {
        where: { id: dto.neoBankId },
      });

      if (!neoBank) {
        throw new NotFoundException(`Neo Bank with ID ${dto.neoBankId} not found`);
      }

      if (neoBank.status !== NeoBankStatus.ACTIVE) {
        throw new BadRequestException(`Neo Bank is not active`);
      }

      // 3. Проверяем баланс USDT на платформе
      if (Number(platform.balance) < dto.usdtAmount) {
        throw new BadRequestException(
          `Insufficient USDT balance on platform ${platform.name}. ` +
          `Available: ${platform.balance} USDT, Required: ${dto.usdtAmount} USDT`
        );
      }

      // 4. Рассчитываем количество песо (по курсу платформы)
      const pesosAmount = dto.usdtAmount * platform.exchangeRate;

      // 5. Списываем USDT с платформы
      platform.balance = Number(platform.balance) - dto.usdtAmount;
      await queryRunner.manager.save(Platform, platform);

      // 6. Добавляем песо в нео-банк и ПРИБАВЛЯЕМ USDT
      const previousBalancePesos = Number(neoBank.currentBalance);
      const previousUsdtEquivalent = Number(neoBank.usdtEquivalent) || 0;
      
      neoBank.currentBalance = previousBalancePesos + pesosAmount;
      
      // ВАЖНО: ПРИБАВЛЯЕМ USDT, а не пересчитываем по курсу!
      // Это сохраняет правильную стоимость при смешанных курсах
      neoBank.usdtEquivalent = previousUsdtEquivalent + dto.usdtAmount;
      
      // Средневзвешенный курс (для справки)
      // Показывает "средний" курс всех пополнений
      neoBank.exchangeRate = neoBank.currentBalance / neoBank.usdtEquivalent;
      
      await queryRunner.manager.save(DropNeoBank, neoBank);

      // 7. Создаем запись об обмене
      const exchange = queryRunner.manager.create(UsdtToPesoExchange, {
        platformId: dto.platformId,
        neoBankId: dto.neoBankId,
        usdtAmount: dto.usdtAmount,
        exchangeRate: platform.exchangeRate,
        pesosAmount: pesosAmount,
        createdByUserId: user.id,
      });

      const savedExchange = await queryRunner.manager.save(UsdtToPesoExchange, exchange);

      await queryRunner.commitTransaction();

      return new ExchangeUsdtToPesosResponseDto(
        savedExchange.id,
        platform.id,
        platform.name,
        neoBank.id,
        neoBank.provider,
        dto.usdtAmount,
        platform.exchangeRate,
        pesosAmount,
        user.id,
        savedExchange.createdAt,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
