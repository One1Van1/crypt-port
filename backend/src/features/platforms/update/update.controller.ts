import { Controller, Patch, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePlatformService } from './update.service';
import { UpdatePlatformRequestDto } from './update.request.dto';
import { UpdatePlatformResponseDto } from './update.response.dto';
import { ApiUpdatePlatform } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('platforms')
@ApiTags('Platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdatePlatformController {
  constructor(private readonly service: UpdatePlatformService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdatePlatform()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlatformRequestDto,
  ): Promise<UpdatePlatformResponseDto> {
    return this.service.execute(id, dto);
  }
}
