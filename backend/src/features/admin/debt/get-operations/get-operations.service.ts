import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from '../../../../entities/debt.entity';
import { DebtOperation } from '../../../../entities/debt-operation.entity';
import { GetDebtOperationsQueryDto } from './get-operations.query.dto';
import { GetDebtOperationsItemDto, GetDebtOperationsResponseDto } from './get-operations.response.dto';

@Injectable()
export class GetDebtOperationsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,

    @InjectRepository(DebtOperation)
    private readonly debtOperationRepository: Repository<DebtOperation>,
  ) {}

  async execute(query: GetDebtOperationsQueryDto): Promise<GetDebtOperationsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const skip = (page - 1) * limit;

    let debt = await this.debtRepository.findOne({ where: { key: 'global' } });

    if (!debt) {
      debt = this.debtRepository.create({ key: 'global', amountUsdt: '0' });
      debt = await this.debtRepository.save(debt);
    }

    const qb = this.debtOperationRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.createdByUser', 'u')
      .leftJoinAndSelect('o.sourceConversion', 'c')
      .where('o.debtId = :debtId', { debtId: debt.id });

    if (query.type) {
      qb.andWhere('o.type = :type', { type: query.type });
    }

    const [items, total] = await qb
      .orderBy('o.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const mapped = items.map(
      (o) =>
        new GetDebtOperationsItemDto({
          id: o.id,
          createdAt: o.createdAt,
          type: o.type,
          deltaUsdt: Number(o.deltaUsdt),
          comment: o.comment ?? null,
          sourceConversionId: o.source_conversion_id ?? null,
          createdByUserId: o.created_by_user_id ?? null,
          createdByUserEmail: o.createdByUser?.email ?? null,
          createdByUserUsername: o.createdByUser?.username ?? null,
        }),
    );

    return new GetDebtOperationsResponseDto(mapped, total, page, limit);
  }
}
