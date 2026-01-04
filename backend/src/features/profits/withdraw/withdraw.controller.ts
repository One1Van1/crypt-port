import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { WithdrawProfitService } from './withdraw.service';
import { WithdrawProfitRequestDto } from './withdraw.request.dto';
import { WithdrawProfitResponseDto } from './withdraw.response.dto';
import { ApiWithdrawProfit } from './openapi.decorator';

@Controller('profits')
@ApiTags('WithdrawProfit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawProfitController {
  constructor(private readonly service: WithdrawProfitService) {}

  @Post('withdraw')
  @Roles(UserRole.ADMIN)
  @ApiWithdrawProfit()
  async handle(
    @Body() dto: WithdrawProfitRequestDto,
    @CurrentUser() user: User,
  ): Promise<WithdrawProfitResponseDto> {
    return this.service.execute(dto, user);
  }
}
