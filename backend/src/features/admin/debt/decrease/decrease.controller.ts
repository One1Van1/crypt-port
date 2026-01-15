import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../../common/enums/user.enum';
import { User } from '../../../../entities/user.entity';
import { ApiDecreaseDebt } from './openapi.decorator';
import { DecreaseDebtService } from './decrease.service';
import { DebtAmountChangeRequestDto } from '../shared/amount.request.dto';
import { DebtAmountChangeResponseDto } from '../shared/amount.response.dto';

@Controller('admin')
@ApiTags('DecreaseDebt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DecreaseDebtController {
  constructor(private readonly service: DecreaseDebtService) {}

  @Post('debt/decrease')
  @Roles(UserRole.ADMIN)
  @ApiDecreaseDebt()
  async handle(
    @Body() dto: DebtAmountChangeRequestDto,
    @CurrentUser() user: User,
  ): Promise<DebtAmountChangeResponseDto> {
    return this.service.execute(dto, user);
  }
}
