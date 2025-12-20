import { Injectable } from '@nestjs/common';
import { User } from '../../../entities/user.entity';
import { LogoutResponseDto } from './logout.response.dto';

@Injectable()
export class LogoutService {
  async execute(user: User): Promise<LogoutResponseDto> {
    // В будущем здесь можно добавить инвалидацию токенов через Redis/БД
    return new LogoutResponseDto();
  }
}
