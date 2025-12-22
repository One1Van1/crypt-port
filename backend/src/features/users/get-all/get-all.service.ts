import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { GetAllUsersQueryDto } from './get-all.query.dto';
import { GetAllUsersResponseDto, UserItemDto } from './get-all.response.dto';

@Injectable()
export class GetAllUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetAllUsersQueryDto): Promise<GetAllUsersResponseDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Фильтр по роли
    if (query.role) {
      queryBuilder.andWhere('user.role = :role', { role: query.role });
    }

    // Поиск по username
    if (query.search) {
      queryBuilder.andWhere('user.username ILIKE :search', { search: `%${query.search}%` });
    }

    // Сортировка
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [items, total] = await queryBuilder
      .take(query.limit || 10)
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .getManyAndCount();

    return new GetAllUsersResponseDto(items.map((u) => new UserItemDto(u)), total);
  }
}
