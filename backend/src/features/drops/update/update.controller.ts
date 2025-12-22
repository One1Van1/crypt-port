import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateDropService } from './update.service';
import { UpdateDropRequestDto } from './update.request.dto';
import { UpdateDropResponseDto } from './update.response.dto';
import { ApiUpdateDrop } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drops')
@ApiTags('Drops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateDropController {
  constructor(private readonly service: UpdateDropService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUpdateDrop()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDropRequestDto,
  ): Promise<UpdateDropResponseDto> {
    return this.service.execute(id, dto);
  }
}
