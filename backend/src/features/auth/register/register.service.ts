import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '../../../entities/user.entity';
import { RegisterRequestDto } from './register.request.dto';
import { RegisterResponseDto } from './register.response.dto';
import { UserRole } from '../../../common/enums/user.enum';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    // Проверка существования username
    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Проверка существования email
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Генерация 2FA секрета
    const secret = speakeasy.generateSecret({
      name: `CryptPort (${dto.username})`,
    });

    // Создание пользователя с ролью PENDING
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.PENDING,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    });

    await this.userRepository.save(user);

    // Создание временного токена для получения QR-кода
    const tempToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        type: 'qr-setup',
      },
      { expiresIn: '10m' }, // Токен на 10 минут
    );

    return new RegisterResponseDto(user, tempToken);
  }
}
