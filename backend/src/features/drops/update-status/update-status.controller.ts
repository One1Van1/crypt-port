import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateDropStatusService } from './update-status.service';
import { UpdateDropStatusRequestDto } from './update-status.request.dto';
import { UpdateDropStatusResponseDto } from './update-status.response.dto';
import { ApiUpdateDropStatus } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drops')
@ApiTags('Drops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateDropStatusController {
  constructor(private readonly service: UpdateDropStatusService) {}

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUpdateDropStatus()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDropStatusRequestDto,
  ): Promise<UpdateDropStatusResponseDto> {
    return this.service.execute(id, dto);
  }
}
