import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { GetOperatorsWithdrawalsResponseDto, OperatorWithdrawalData } from './get-operators-withdrawals.response.dto';

@Injectable()
export class GetOperatorsWithdrawalsService {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
  ) {}

  async execute(): Promise<GetOperatorsWithdrawalsResponseDto> {
    // Получаем все обналички
    const withdrawals = await this.cashWithdrawalRepository.find({
      relations: ['withdrawnByUser'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });

    // Получаем все конвертации
    const conversions = await this.conversionRepository.find({
      relations: ['convertedByUser'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });

    // Создаём записи для каждого withdrawal
    const withdrawalsData: OperatorWithdrawalData[] = withdrawals.map((withdrawal) => {
      // Находим подтверждённые конвертации этого юзера
      const userConversions = conversions.filter(
        c => c.convertedByUserId === withdrawal.withdrawnByUserId && c.status === 'confirmed'
      );
      const totalUsdtReturned = userConversions.reduce((sum, c) => sum + Number(c.usdtAmount), 0);
      
      // Берём последнюю конвертацию для курса
      const lastConversion = userConversions[userConversions.length - 1];
      
      return {
        id: withdrawal.id,
        name: withdrawal.withdrawnByUser?.username || 'Unknown',
        totalTransactions: 1,
        completedTransactions: withdrawal.status === 'converted' ? 1 : 0,
        
        // Часть 1: Забрал наличные
        withdrawnAmount: Number(withdrawal.amountPesos),
        withdrawalRate: Number(withdrawal.withdrawalRate),
        bankId: withdrawal.bankAccountId,
        
        // Часть 2: В процессе (pending или awaiting_confirmation)
        inProcessAmount: ['pending', 'awaiting_confirmation'].includes(withdrawal.status) 
          ? Number(withdrawal.amountPesos) 
          : 0,
        status: withdrawal.status,
        
        // Часть 3: Вернул USDT (confirmed conversions)
        convertedAmount: withdrawal.status === 'converted' ? totalUsdtReturned : 0,
        conversionRate: withdrawal.status === 'converted' && lastConversion 
          ? Number(lastConversion.exchangeRate) 
          : 0,
      };
    });

    return new GetOperatorsWithdrawalsResponseDto(withdrawalsData);
  }
}
