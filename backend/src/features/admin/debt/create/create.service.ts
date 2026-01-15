import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from '../../../../entities/debt.entity';
import { DebtOperation, DebtOperationType } from '../../../../entities/debt-operation.entity';
import { User } from '../../../../entities/user.entity';
import { CreateDebtRequestDto } from './create.request.dto';
import { CreateDebtResponseDto } from './create.response.dto';

@Injectable()
export class CreateDebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtOperation)
    private readonly debtOperationRepository: Repository<DebtOperation>,
  ) {}

  async execute(dto: CreateDebtRequestDto, user: User): Promise<CreateDebtResponseDto> {
    const existing = await this.debtRepository.findOne({ where: { key: 'global' } });

    const newAmount = Number(dto.amountUsdt);
    const oldAmount = existing ? Number(existing.amountUsdt) : 0;
    const delta = newAmount - oldAmount;

    const debt = existing
      ? await this.debtRepository.save({ ...existing, amountUsdt: String(newAmount) })
      : await this.debtRepository.save(
          this.debtRepository.create({ key: 'global', amountUsdt: String(newAmount) }),
        );

    await this.debtOperationRepository.save(
      this.debtOperationRepository.create({
        debtId: debt.id,
        type: DebtOperationType.MANUAL_SET,
        deltaUsdt: String(delta),
        comment: dto.comment ?? null,
        created_by_user_id: user.id,
      }),
    );

    return new CreateDebtResponseDto(debt.id, Number(debt.amountUsdt));
  }
}
