import { Controller, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EndShiftService } from './end.service';
import { EndShiftResponseDto } from './end.response.dto';
import { ApiEndShift } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('shifts')
@ApiTags('Shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EndShiftController {
  constructor(private readonly service: EndShiftService) {}

  @Post(':id/end')
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiEndShift()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<EndShiftResponseDto> {
    return this.service.execute(id, user);
  }
}
