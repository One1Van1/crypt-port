import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from '../../../../entities/debt.entity';
import { DebtOperation, DebtOperationType } from '../../../../entities/debt-operation.entity';
import { User } from '../../../../entities/user.entity';
import { DebtAmountChangeRequestDto } from '../shared/amount.request.dto';
import { DebtAmountChangeResponseDto } from '../shared/amount.response.dto';

@Injectable()
export class DecreaseDebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,

    @InjectRepository(DebtOperation)
    private readonly debtOperationRepository: Repository<DebtOperation>,
  ) {}

  async execute(dto: DebtAmountChangeRequestDto, user: User): Promise<DebtAmountChangeResponseDto> {
    let debt = await this.debtRepository.findOne({ where: { key: 'global' } });

    if (!debt) {
      debt = this.debtRepository.create({ key: 'global', amountUsdt: '0' });
      debt = await this.debtRepository.save(debt);
    }

    const decRequested = Number(dto.amountUsdt);
    const oldAmount = Number(debt.amountUsdt);

    if (oldAmount <= 0) {
      throw new BadRequestException('Долг отсутствует');
    }

    if (decRequested > oldAmount) {
      throw new BadRequestException('Вы указали сумму больше суммы долга');
    }

    const newAmount = oldAmount - decRequested;
    const delta = -decRequested;

    debt.amountUsdt = String(newAmount);
    await this.debtRepository.save(debt);

    await this.debtOperationRepository.save(
      this.debtOperationRepository.create({
        debtId: debt.id,
        type: DebtOperationType.MANUAL_SET,
        deltaUsdt: String(delta),
        comment: dto.comment ?? null,
        created_by_user_id: user.id,
      }),
    );

    return new DebtAmountChangeResponseDto(debt.id, Number(debt.amountUsdt), delta);
  }
}
