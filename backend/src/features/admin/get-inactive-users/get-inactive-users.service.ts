import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UserStatus } from '../../../common/enums/user.enum';
import { GetInactiveUsersItemDto, GetInactiveUsersResponseDto } from './get-inactive-users.response.dto';

@Injectable()
export class GetInactiveUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(): Promise<GetInactiveUsersResponseDto> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.status = :status', { status: UserStatus.INACTIVE })
      .orderBy('user.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return new GetInactiveUsersResponseDto(items.map((u) => new GetInactiveUsersItemDto(u)), total);
  }
}
