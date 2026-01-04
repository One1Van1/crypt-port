import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../../entities/system-setting.entity';
import { SetInitialDepositRequestDto } from './set-initial-deposit.request.dto';
import { SetInitialDepositResponseDto } from './set-initial-deposit.response.dto';

@Injectable()
export class SetInitialDepositService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepository: Repository<SystemSetting>,
  ) {}

  async execute(dto: SetInitialDepositRequestDto): Promise<SetInitialDepositResponseDto> {
    let setting = await this.settingRepository.findOne({
      where: { key: 'initial_deposit' },
    });

    if (!setting) {
      setting = this.settingRepository.create({
        key: 'initial_deposit',
        value: dto.initialDeposit.toString(),
        description: 'Initial working deposit in USDT',
      });
    } else {
      setting.value = dto.initialDeposit.toString();
    }

    const saved = await this.settingRepository.save(setting);

    return new SetInitialDepositResponseDto(dto.initialDeposit, saved.updatedAt);
  }
}
