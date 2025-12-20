import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogoutService } from './logout.service';
import { LogoutResponseDto } from './logout.response.dto';
import { ApiLogout } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('auth')
@ApiTags('Auth - Logout')
export class LogoutController {
  constructor(private readonly service: LogoutService) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiLogout()
  async handle(@CurrentUser() user: User): Promise<LogoutResponseDto> {
    return this.service.execute(user);
  }
}
