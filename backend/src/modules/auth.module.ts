import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { JwtStrategy } from '../common/strategies/jwt.strategy';

// Auth Controllers
import { RegisterController } from '../features/auth/register/register.controller';
import { RegisterAdminController } from '../features/auth/register-admin/register-admin.controller';
import { GetQrCodeController } from '../features/auth/get-qr-code/get-qr-code.controller';
import { LoginController } from '../features/auth/login/login.controller';
import { Verify2faController } from '../features/auth/verify-2fa/verify-2fa.controller';
import { MeController } from '../features/auth/me/me.controller';
import { LogoutController } from '../features/auth/logout/logout.controller';
import { RefreshController } from '../features/auth/refresh/refresh.controller';

// Auth Services
import { RegisterService } from '../features/auth/register/register.service';
import { RegisterAdminService } from '../features/auth/register-admin/register-admin.service';
import { GetQrCodeService } from '../features/auth/get-qr-code/get-qr-code.service';
import { LoginService } from '../features/auth/login/login.service';
import { Verify2faService } from '../features/auth/verify-2fa/verify-2fa.service';
import { MeService } from '../features/auth/me/me.service';
import { LogoutService } from '../features/auth/logout/logout.service';
import { RefreshService } from '../features/auth/refresh/refresh.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [
    RegisterController,
    RegisterAdminController,
    GetQrCodeController,
    LoginController,
    Verify2faController,
    MeController,
    LogoutController,
    RefreshController,
  ],
  providers: [
    RegisterService,
    RegisterAdminService,
    GetQrCodeService,
    LoginService,
    Verify2faService,
    MeService,
    LogoutService,
    RefreshService,
    JwtStrategy,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
