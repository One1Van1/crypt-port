import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PesoToUsdtConversion } from '../../../entities/peso-to-usdt-conversion.entity';
import { GetAllConversionsResponseDto } from './get-all-conversions.response.dto';

@Injectable()
export class GetAllConversionsService {
  constructor(
    @InjectRepository(PesoToUsdtConversion)
    private readonly conversionRepository: Repository<PesoToUsdtConversion>,
  ) {}

  async execute(): Promise<GetAllConversionsResponseDto> {
    const conversions = await this.conversionRepository.find({
      relations: ['convertedByUser', 'cashWithdrawal', 'cashWithdrawal.withdrawnByUser'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });

    return new GetAllConversionsResponseDto(conversions);
  }
}
