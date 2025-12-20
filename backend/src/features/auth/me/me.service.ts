import { Injectable } from '@nestjs/common';
import { User } from '../../../entities/user.entity';
import { MeResponseDto } from './me.response.dto';

@Injectable()
export class MeService {
  async execute(user: User): Promise<MeResponseDto> {
    return new MeResponseDto(user);
  }
}
