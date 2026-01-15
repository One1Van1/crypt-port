import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../../common/enums/user.enum';
import { User } from '../../../../entities/user.entity';
import { ApiIncreaseDebt } from './openapi.decorator';
import { IncreaseDebtService } from './increase.service';
import { DebtAmountChangeRequestDto } from '../shared/amount.request.dto';
import { DebtAmountChangeResponseDto } from '../shared/amount.response.dto';

@Controller('admin')
@ApiTags('IncreaseDebt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IncreaseDebtController {
  constructor(private readonly service: IncreaseDebtService) {}

  @Post('debt/increase')
  @Roles(UserRole.ADMIN)
  @ApiIncreaseDebt()
  async handle(
    @Body() dto: DebtAmountChangeRequestDto,
    @CurrentUser() user: User,
  ): Promise<DebtAmountChangeResponseDto> {
    return this.service.execute(dto, user);
  }
}
