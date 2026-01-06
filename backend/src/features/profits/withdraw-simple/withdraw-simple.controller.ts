import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { WithdrawSimpleProfitService } from './withdraw-simple.service';
import { WithdrawSimpleProfitRequestDto } from './withdraw-simple.request.dto';
import { WithdrawSimpleProfitResponseDto } from './withdraw-simple.response.dto';
import { ApiWithdrawSimpleProfit } from './openapi.decorator';

@Controller('profits')
@ApiTags('WithdrawSimpleProfit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawSimpleProfitController {
  constructor(private readonly service: WithdrawSimpleProfitService) {}

  @Post('withdraw-simple')
  @Roles(UserRole.ADMIN)
  @ApiWithdrawSimpleProfit()
  async handle(
    @Body() dto: WithdrawSimpleProfitRequestDto,
    @CurrentUser() user: User,
  ): Promise<WithdrawSimpleProfitResponseDto> {
    return this.service.execute(dto, user);
  }
}
