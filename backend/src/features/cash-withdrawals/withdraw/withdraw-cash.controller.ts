import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WithdrawCashService } from './withdraw-cash.service';
import { WithdrawCashDto } from './withdraw-cash.dto';
import { WithdrawCashResponseDto } from './withdraw-cash.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiWithdrawCash } from './openapi.decorator';

@Controller('cash-withdrawals')
@ApiTags('CashWithdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawCashController {
  constructor(private readonly service: WithdrawCashService) {}

  @Post('withdraw')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiWithdrawCash()
  async handle(
    @Body() dto: WithdrawCashDto,
    @Request() req,
  ): Promise<WithdrawCashResponseDto> {
    return this.service.execute(dto, req.user.userId);
  }
}
