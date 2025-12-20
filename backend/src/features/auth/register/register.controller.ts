import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterService } from './register.service';
import { RegisterRequestDto } from './register.request.dto';
import { RegisterResponseDto } from './register.response.dto';
import { ApiRegister } from './openapi.decorator';

@Controller('auth')
@ApiTags('Auth - Register')
export class RegisterController {
  constructor(private readonly service: RegisterService) {}

  @Post('register')
  @ApiRegister()
  async handle(@Body() dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.service.execute(dto);
  }
}
