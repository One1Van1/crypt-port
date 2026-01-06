import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiWithdrawSimpleConfirmedProfit } from './openapi.decorator';
import { WithdrawSimpleConfirmedProfitRequestDto } from './withdraw-simple-confirmed.request.dto';
import { WithdrawSimpleConfirmedProfitResponseDto } from './withdraw-simple-confirmed.response.dto';
import { WithdrawSimpleConfirmedProfitService } from './withdraw-simple-confirmed.service';

@Controller('profits')
@ApiTags('WithdrawSimpleConfirmedProfit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawSimpleConfirmedProfitController {
  constructor(private readonly service: WithdrawSimpleConfirmedProfitService) {}

  @Post('withdraw-simple-confirmed')
  @Roles(UserRole.ADMIN)
  @ApiWithdrawSimpleConfirmedProfit()
  async handle(
    @Body() dto: WithdrawSimpleConfirmedProfitRequestDto,
    @CurrentUser() user: User,
  ): Promise<WithdrawSimpleConfirmedProfitResponseDto> {
    return this.service.execute(dto, user);
  }
}
