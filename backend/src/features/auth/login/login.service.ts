import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../entities/user.entity';
import { LoginRequestDto } from './login.request.dto';
import { LoginResponseDto } from './login.response.dto';
import { UserRole } from '../../../common/enums/user.enum';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // Поиск пользователя
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверка роли - PENDING не может авторизоваться
    if (user.role === UserRole.PENDING) {
      throw new ForbiddenException('Your account is pending approval. Please wait for admin to assign a role.');
    }

    // Создание временного токена для 2FA
    const tempToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        type: 'temp',
      },
      { expiresIn: '5m' }, // Временный токен на 5 минут
    );

    return new LoginResponseDto(tempToken, user.id, user.twoFactorEnabled);
  }
}
