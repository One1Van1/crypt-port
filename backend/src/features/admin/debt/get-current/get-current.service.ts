import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from '../../../../entities/debt.entity';
import { GetCurrentDebtResponseDto } from './get-current.response.dto';

@Injectable()
export class GetCurrentDebtService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
  ) {}

  async execute(): Promise<GetCurrentDebtResponseDto> {
    let debt = await this.debtRepository.findOne({ where: { key: 'global' } });

    if (!debt) {
      debt = this.debtRepository.create({ key: 'global', amountUsdt: '0' });
      debt = await this.debtRepository.save(debt);
    }

    return new GetCurrentDebtResponseDto(debt.id, Number(debt.amountUsdt));
  }
}
