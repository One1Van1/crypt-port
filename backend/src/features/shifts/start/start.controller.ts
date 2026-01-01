import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StartShiftService } from './start.service';
import { StartShiftRequestDto } from './start.request.dto';
import { StartShiftResponseDto } from './start.response.dto';
import { ApiStartShift } from './openapi.decorator';
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
export class StartShiftController {
  constructor(private readonly service: StartShiftService) {}

  @Post('start')
  @Roles(UserRole.OPERATOR)
  @ApiStartShift()
  async handle(
    @Body() dto: StartShiftRequestDto,
    @CurrentUser() user: User,
  ): Promise<StartShiftResponseDto> {
    return this.service.execute(dto, user);
  }
}
