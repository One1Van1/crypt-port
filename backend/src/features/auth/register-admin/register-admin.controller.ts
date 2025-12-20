import { Controller, Post, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterAdminService } from './register-admin.service';
import { RegisterAdminRequestDto } from './register-admin.request.dto';
import { RegisterAdminResponseDto } from './register-admin.response.dto';
import { ApiRegisterAdmin } from './openapi.decorator';

@Controller('auth')
@ApiTags('Auth - Register Admin')
export class RegisterAdminController {
  constructor(private readonly service: RegisterAdminService) {}

  @Post('register-admin')
  @ApiRegisterAdmin()
  async handle(
    @Query('masterKey') masterKey: string,
    @Body() dto: RegisterAdminRequestDto,
  ): Promise<RegisterAdminResponseDto> {
    return this.service.execute(masterKey, dto);
  }
}
