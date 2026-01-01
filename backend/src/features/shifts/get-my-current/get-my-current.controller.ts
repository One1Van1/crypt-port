import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetMyCurrentShiftService } from './get-my-current.service';
import { GetMyCurrentShiftResponseDto } from './get-my-current.response.dto';
import { ApiGetMyCurrentShift } from './openapi.decorator';
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
export class GetMyCurrentShiftController {
  constructor(private readonly service: GetMyCurrentShiftService) {}

  @Get('my-current')
  @Roles(UserRole.OPERATOR)
  @ApiGetMyCurrentShift()
  async handle(@CurrentUser() user: User): Promise<GetMyCurrentShiftResponseDto | null> {
    return this.service.execute(user);
  }
}
