import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RefreshService } from './refresh.service';
import { RefreshRequestDto } from './refresh.request.dto';
import { RefreshResponseDto } from './refresh.response.dto';
import { ApiRefresh } from './openapi.decorator';

@Controller('auth')
@ApiTags('Auth - Refresh Token')
export class RefreshController {
  constructor(private readonly service: RefreshService) {}

  @Post('refresh')
  @ApiRefresh()
  async handle(@Body() dto: RefreshRequestDto): Promise<RefreshResponseDto> {
    return this.service.execute(dto);
  }
}
