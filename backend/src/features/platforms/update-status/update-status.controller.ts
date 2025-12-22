import { Controller, Patch, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePlatformStatusService } from './update-status.service';
import { UpdatePlatformStatusRequestDto } from './update-status.request.dto';
import { UpdatePlatformStatusResponseDto } from './update-status.response.dto';
import { ApiUpdatePlatformStatus } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('platforms')
@ApiTags('Platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdatePlatformStatusController {
  constructor(private readonly service: UpdatePlatformStatusService) {}

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiUpdatePlatformStatus()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlatformStatusRequestDto,
  ): Promise<UpdatePlatformStatusResponseDto> {
    return this.service.execute(id, dto);
  }
}
