import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MeService } from './me.service';
import { MeResponseDto } from './me.response.dto';
import { ApiMe } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('auth')
@ApiTags('Auth - User Info')
export class MeController {
  constructor(private readonly service: MeService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiMe()
  async handle(@CurrentUser() user: User): Promise<MeResponseDto> {
    return this.service.execute(user);
  }
}
