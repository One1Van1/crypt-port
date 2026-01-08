import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UserStatus } from '../../../common/enums/user.enum';
import { GetActiveUsersItemDto, GetActiveUsersResponseDto } from './get-active-users.response.dto';

@Injectable()
export class GetActiveUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(): Promise<GetActiveUsersResponseDto> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetActiveUsersResponseDto(items.map((u) => new GetActiveUsersItemDto(u)), total);
  }
}
