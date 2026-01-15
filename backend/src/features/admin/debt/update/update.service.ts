import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from '../../../../entities/debt.entity';
import { DebtOperation, DebtOperationType } from '../../../../entities/debt-operation.entity';
import { User } from '../../../../entities/user.entity';
import { UpdateDebtRequestDto } from './update.request.dto';
import { UpdateDebtResponseDto } from './update.response.dto';

@Injectable()
export class UpdateDebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtOperation)
    private readonly debtOperationRepository: Repository<DebtOperation>,
  ) {}

  async execute(id: number, dto: UpdateDebtRequestDto, user: User): Promise<UpdateDebtResponseDto> {
    const debt = await this.debtRepository.findOne({ where: { id } });
    if (!debt) throw new NotFoundException('Debt not found');

    const oldAmount = Number(debt.amountUsdt);
    const newAmount = Number(dto.amountUsdt);
    const delta = newAmount - oldAmount;

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

    return new UpdateDebtResponseDto(debt.id, newAmount, delta);
  }
}
