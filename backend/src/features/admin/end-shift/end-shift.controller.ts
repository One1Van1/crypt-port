import { Controller, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { AdminEndShiftService } from './end-shift.service';
import { AdminEndShiftResponseDto } from './end-shift.response.dto';
import { ApiAdminEndShift } from './openapi.decorator';

@Controller('admin/shifts')
@ApiTags('AdminShifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminEndShiftController {
  constructor(private readonly service: AdminEndShiftService) {}

  @Post(':id/end')
  @Roles(UserRole.ADMIN)
  @ApiAdminEndShift()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<AdminEndShiftResponseDto> {
    return this.service.execute(id);
  }
}
