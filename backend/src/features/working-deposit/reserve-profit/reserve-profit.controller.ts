import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReserveProfitService } from './reserve-profit.service';
import { ReserveProfitRequestDto } from './reserve-profit.request.dto';
import { ReserveProfitResponseDto } from './reserve-profit.response.dto';
import { ApiReserveProfit } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('working-deposit')
@ApiTags('ReserveProfit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReserveProfitController {
  constructor(private readonly service: ReserveProfitService) {}

  @Post('reserve-profit')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiReserveProfit()
  async handle(
    @Body() dto: ReserveProfitRequestDto,
    @CurrentUser() user: User,
  ): Promise<ReserveProfitResponseDto> {
    return this.service.execute(dto, user);
  }
}
