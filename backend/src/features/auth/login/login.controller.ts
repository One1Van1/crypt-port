import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginService } from './login.service';
import { LoginRequestDto } from './login.request.dto';
import { LoginResponseDto } from './login.response.dto';
import { ApiLogin } from './openapi.decorator';

@Controller('auth')
@ApiTags('Auth - Login')
export class LoginController {
  constructor(private readonly service: LoginService) {}

  @Post('login')
  @ApiLogin()
  async handle(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.service.execute(dto);
  }
}
