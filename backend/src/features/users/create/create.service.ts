import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';
import { CreateUserRequestDto } from './create.request.dto';
import { CreateUserResponseDto } from './create.response.dto';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const role = dto.role ?? UserRole.OPERATOR;

    if (![UserRole.OPERATOR, UserRole.TEAMLEAD].includes(role)) {
      throw new BadRequestException('Only OPERATOR or TEAMLEAD roles can be created');
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const secret = speakeasy.generateSecret({
      name: `CryptPort (${dto.username})`,
    });

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    });

    await this.userRepository.save(user);

    const tempToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        type: 'qr-setup',
      },
      { expiresIn: '10m' },
    );

    return new CreateUserResponseDto(user, tempToken);
  }
}
