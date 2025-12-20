import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from '../../../entities/user.entity';

@Injectable()
export class GetQrCodeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(tempToken: string): Promise<Buffer> {
    // Проверка временного токена
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken);
      if (payload.type !== 'qr-setup') {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userWithSecret = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!userWithSecret || !userWithSecret.twoFactorSecret) {
      throw new NotFoundException('User or 2FA secret not found');
    }

    // Генерация otpauth URL
    const otpauthUrl = speakeasy.otpauthURL({
      secret: userWithSecret.twoFactorSecret,
      label: `CryptPort (${userWithSecret.username})`,
      issuer: 'CryptPort',
      encoding: 'base32',
    });

    // Генерация QR кода как Buffer
    const qrCodeBuffer = await qrcode.toBuffer(otpauthUrl, {
      type: 'png',
      width: 300,
      margin: 2,
    });

    return qrCodeBuffer;
  }
}
