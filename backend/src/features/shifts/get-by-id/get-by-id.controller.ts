import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetShiftByIdService } from './get-by-id.service';
import { GetShiftByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetShiftById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('shifts')
@ApiTags('Shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetShiftByIdController {
  constructor(private readonly service: GetShiftByIdService) {}

  @Get('by-id/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetShiftById()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<GetShiftByIdResponseDto> {
    return this.service.execute(id);
  }
}
