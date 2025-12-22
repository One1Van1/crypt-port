import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePlatformService } from './create.service';
import { CreatePlatformRequestDto } from './create.request.dto';
import { CreatePlatformResponseDto } from './create.response.dto';
import { ApiCreatePlatform } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('platforms')
@ApiTags('Platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreatePlatformController {
  constructor(private readonly service: CreatePlatformService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatePlatform()
  async handle(@Body() dto: CreatePlatformRequestDto): Promise<CreatePlatformResponseDto> {
    return this.service.execute(dto);
  }
}
