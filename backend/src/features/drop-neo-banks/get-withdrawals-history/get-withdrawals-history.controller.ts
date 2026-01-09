import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetNeoBankWithdrawalsHistory } from './openapi.decorator';
import { GetNeoBankWithdrawalsHistoryQueryDto } from './get-withdrawals-history.query.dto';
import { GetNeoBankWithdrawalsHistoryResponseDto } from './get-withdrawals-history.response.dto';
import { GetNeoBankWithdrawalsHistoryService } from './get-withdrawals-history.service';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBanksWithdrawalsHistory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetNeoBankWithdrawalsHistoryController {
  constructor(private readonly service: GetNeoBankWithdrawalsHistoryService) {}

  @Get('withdrawals-history')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetNeoBankWithdrawalsHistory()
  async handle(
    @Query() query: GetNeoBankWithdrawalsHistoryQueryDto,
  ): Promise<GetNeoBankWithdrawalsHistoryResponseDto> {
    return this.service.execute(query);
  }
}
