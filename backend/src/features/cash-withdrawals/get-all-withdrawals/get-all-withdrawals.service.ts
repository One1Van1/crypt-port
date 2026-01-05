import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashWithdrawal } from '../../../entities/cash-withdrawal.entity';
import { GetAllWithdrawalsResponseDto, WithdrawalItem } from './get-all-withdrawals.response.dto';

@Injectable()
export class GetAllWithdrawalsService {
  constructor(
    @InjectRepository(CashWithdrawal)
    private readonly cashWithdrawalRepository: Repository<CashWithdrawal>,
  ) {}

  async execute(): Promise<GetAllWithdrawalsResponseDto> {
    const withdrawals = await this.cashWithdrawalRepository.find({
      relations: ['withdrawnByUser'],
      order: { createdAt: 'DESC' },
    });

    const items = withdrawals.map((withdrawal) => ({
      id: String(withdrawal.id),
      amountPesos: Number(withdrawal.amountPesos),
      withdrawalRate: Number(withdrawal.withdrawalRate),
      status: withdrawal.status,
      bankAccountId: withdrawal.bankAccountId,
      comment: withdrawal.comment,
      createdAt: withdrawal.createdAt,
      withdrawnByUser: withdrawal.withdrawnByUser
        ? {
            id: String(withdrawal.withdrawnByUser.id),
            username: withdrawal.withdrawnByUser.username,
          }
        : null,
    }));

    return { items };
  }
}
