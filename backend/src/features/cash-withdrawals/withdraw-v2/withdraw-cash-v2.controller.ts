import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiWithdrawCashV2 } from './openapi.decorator';
import { WithdrawCashV2Dto } from './withdraw-cash-v2.dto';
import { WithdrawCashV2ResponseDto } from './withdraw-cash-v2.response.dto';
import { WithdrawCashV2Service } from './withdraw-cash-v2.service';

@Controller('cash-withdrawals')
@ApiTags('CashWithdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WithdrawCashV2Controller {
  constructor(private readonly service: WithdrawCashV2Service) {}

  @Post('withdraw-v2')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiWithdrawCashV2()
  async handle(@Body() dto: WithdrawCashV2Dto, @Request() req): Promise<WithdrawCashV2ResponseDto> {
    const userId = Number(req.user.userId || req.user.id);
    return this.service.execute(dto, userId);
  }
}
