import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import { User } from '../../../entities/user.entity';
import { Verify2faRequestDto } from './verify-2fa.request.dto';
import { Verify2faResponseDto } from './verify-2fa.response.dto';

@Injectable()
export class Verify2faService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: Verify2faRequestDto): Promise<Verify2faResponseDto> {
    // Проверка временного токена
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.tempToken);
      if (payload.type !== 'temp') {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    // Получение пользователя
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Если 2FA еще не включен, включаем его после первой успешной верификации
    if (!user.twoFactorEnabled) {
      // Проверка кода для первой настройки
      const isValidCode = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: dto.code,
        window: 2,
      });

      if (!isValidCode) {
        throw new BadRequestException('Invalid 2FA code');
      }

      // Включаем 2FA
      user.twoFactorEnabled = true;
      await this.userRepository.save(user);
    } else {
      // Проверка кода для обычного входа
      const isValidCode = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: dto.code,
        window: 2,
      });

      if (!isValidCode) {
        throw new BadRequestException('Invalid 2FA code');
      }
    }

    // Создание access и refresh токенов
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        type: 'refresh',
      },
      { expiresIn: '7d' },
    );

    return new Verify2faResponseDto(accessToken, refreshToken, user);
  }
}
