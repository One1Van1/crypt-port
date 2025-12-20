import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '../../../entities/user.entity';
import { RegisterAdminRequestDto } from './register-admin.request.dto';
import { RegisterAdminResponseDto } from './register-admin.response.dto';
import { UserRole } from '../../../common/enums/user.enum';

@Injectable()
export class RegisterAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(masterKey: string, dto: RegisterAdminRequestDto): Promise<RegisterAdminResponseDto> {
    // Проверка MASTER_KEY
    const envMasterKey = process.env.MASTER_KEY;
    if (!envMasterKey || masterKey !== envMasterKey) {
      throw new UnauthorizedException('Invalid master key');
    }

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
      name: `CryptPort Admin (${dto.username})`,
    });

    // Создание админа
    const admin = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    });

    await this.userRepository.save(admin);

    // Создание временного токена для получения QR-кода
    const tempToken = this.jwtService.sign(
      {
        sub: admin.id,
        username: admin.username,
        type: 'qr-setup',
      },
      { expiresIn: '10m' }, // Токен на 10 минут
    );

    return new RegisterAdminResponseDto(admin, tempToken);
  }
}
