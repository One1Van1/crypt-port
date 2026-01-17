import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreeUsdtAdjustment, FreeUsdtAdjustmentReason } from '../../../entities/free-usdt-adjustment.entity';
import { User } from '../../../entities/user.entity';
import { MintFreeUsdtRequestDto } from './mint.request.dto';
import { MintFreeUsdtResponseDto } from './mint.response.dto';

@Injectable()
export class MintFreeUsdtService {
  constructor(
    @InjectRepository(FreeUsdtAdjustment)
    private readonly freeUsdtAdjustmentRepository: Repository<FreeUsdtAdjustment>,
  ) {}

  async execute(dto: MintFreeUsdtRequestDto, user: User): Promise<MintFreeUsdtResponseDto> {
    if (!Number.isFinite(dto.amountUsdt) || dto.amountUsdt <= 0) {
      throw new BadRequestException('amountUsdt must be a positive number');
    }

    const adjustment = this.freeUsdtAdjustmentRepository.create({
      reason: FreeUsdtAdjustmentReason.ADMIN_MINT,
      amountUsdt: String(dto.amountUsdt),
      created_by_user_id: user.id,
    });

    const saved = await this.freeUsdtAdjustmentRepository.save(adjustment);

    return new MintFreeUsdtResponseDto({
      adjustmentId: saved.id,
      amountUsdt: Number(saved.amountUsdt),
      reason: saved.reason,
      createdByUserId: user.id,
      createdAt: saved.createdAt.toISOString(),
    });
  }
}
