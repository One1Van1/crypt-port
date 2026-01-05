import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { ConversionStatus } from '../../../common/enums/conversion-status.enum';
import { CashWithdrawalStatus } from '../../../common/enums/cash-withdrawal-status.enum';
import { ConfirmConversionResponseDto } from './confirm-conversion.response.dto';

@Injectable()
export class ConfirmConversionService {
  constructor(
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
  ) {}

  async execute(id: number): Promise<ConfirmConversionResponseDto> {
    const conversion = await this.conversionRepository.findOne({
      where: { id },
      relations: ['convertedByUser'],
    });

    if (!conversion) {
      throw new NotFoundException('Conversion not found');
    }

    // Подтверждаем конвертацию
    conversion.status = ConversionStatus.CONFIRMED;
    const updated = await this.conversionRepository.save(conversion);

    // Находим все withdrawals в статусе AWAITING_CONFIRMATION от этого пользователя
    // и помечаем их как CONVERTED
    const awaitingWithdrawals = await this.cashWithdrawalRepository.find({
      where: {
        withdrawnByUserId: conversion.convertedByUserId,
        status: CashWithdrawalStatus.AWAITING_CONFIRMATION,
      },
    });

    // Помечаем как converted
    for (const withdrawal of awaitingWithdrawals) {
      withdrawal.status = CashWithdrawalStatus.CONVERTED;
      await this.cashWithdrawalRepository.save(withdrawal);
    }

    return new ConfirmConversionResponseDto(
      updated.id,
      updated.status,
      updated.usdtAmount,
    );
  }
}
