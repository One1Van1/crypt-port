import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';
import { GetAllDropNeoBanksQueryDto } from './get-all.query.dto';
import { GetAllDropNeoBanksResponseDto } from './get-all.response.dto';

@Injectable()
export class GetAllDropNeoBanksService {
  constructor(
    @InjectRepository(DropNeoBank)
    private readonly dropNeoBankRepository: Repository<DropNeoBank>,
  ) {}

  async execute(query: GetAllDropNeoBanksQueryDto): Promise<GetAllDropNeoBanksResponseDto> {
    const queryBuilder = this.dropNeoBankRepository
      .createQueryBuilder('dnb')
      .leftJoinAndSelect('dnb.drop', 'drop')
      .leftJoinAndSelect('dnb.platform', 'platform');

    if (query.dropId) {
      queryBuilder.andWhere('dnb.dropId = :dropId', { dropId: query.dropId });
    }

    if (query.platformId) {
      queryBuilder.andWhere('dnb.platformId = :platformId', { platformId: query.platformId });
    }

    if (query.provider) {
      queryBuilder.andWhere('dnb.provider = :provider', { provider: query.provider });
    }

    if (query.status) {
      queryBuilder.andWhere('dnb.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('dnb.provider', 'ASC');

    const items = await queryBuilder.getMany();

    return new GetAllDropNeoBanksResponseDto(items);
  }
}
