import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Verify2faService } from './verify-2fa.service';
import { Verify2faRequestDto } from './verify-2fa.request.dto';
import { Verify2faResponseDto } from './verify-2fa.response.dto';
import { ApiVerify2fa } from './openapi.decorator';

@Controller('auth')
@ApiTags('Auth - 2FA')
export class Verify2faController {
  constructor(private readonly service: Verify2faService) {}

  @Post('verify-2fa')
  @ApiVerify2fa()
  async handle(@Body() dto: Verify2faRequestDto): Promise<Verify2faResponseDto> {
    return this.service.execute(dto);
  }
}
