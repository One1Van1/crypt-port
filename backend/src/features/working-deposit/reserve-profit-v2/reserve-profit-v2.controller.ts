import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { ApiReserveProfitV2 } from './openapi.decorator';
import { ReserveProfitV2RequestDto } from './reserve-profit-v2.request.dto';
import { ReserveProfitV2ResponseDto } from './reserve-profit-v2.response.dto';
import { ReserveProfitV2Service } from './reserve-profit-v2.service';

@Controller('working-deposit')
@ApiTags('ReserveProfitV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReserveProfitV2Controller {
  constructor(private readonly service: ReserveProfitV2Service) {}

  @Post('reserve-profit-v2')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiReserveProfitV2()
  async handle(
    @Body() dto: ReserveProfitV2RequestDto,
    @CurrentUser() user: User,
  ): Promise<ReserveProfitV2ResponseDto> {
    return this.service.execute(dto, user);
  }
}
