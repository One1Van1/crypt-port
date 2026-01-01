import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../entities/user.entity';
import { RefreshRequestDto } from './refresh.request.dto';
import { RefreshResponseDto } from './refresh.response.dto';

@Injectable()
export class RefreshService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshRequestDto): Promise<RefreshResponseDto> {
    // Проверка refresh токена
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Получение пользователя
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Создание новых токенов
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      { expiresIn: '24h' }, // Токен действует 24 часа
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        type: 'refresh',
      },
      { expiresIn: '7d' },
    );

    return new RefreshResponseDto(accessToken, refreshToken);
  }
}
