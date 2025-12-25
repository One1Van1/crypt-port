import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetMyShiftsService } from './get-my-shifts.service';
import { GetMyShiftsResponseDto } from './get-my-shifts.response.dto';
import { ApiGetMyShifts } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('shifts')
@ApiTags('GetMyShifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetMyShiftsController {
  constructor(private readonly service: GetMyShiftsService) {}

  @Get('my-shifts')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetMyShifts()
  async handle(@CurrentUser() user: User): Promise<GetMyShiftsResponseDto> {
    return this.service.execute(user);
  }
}
