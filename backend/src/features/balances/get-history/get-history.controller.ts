import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetBalanceHistoryService } from './get-history.service';
import { GetBalanceHistoryQueryDto } from './get-history.query.dto';
import { GetBalanceHistoryResponseDto } from './get-history.response.dto';
import { ApiGetBalanceHistory } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('balances')
@ApiTags('Balances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetBalanceHistoryController {
  constructor(private readonly service: GetBalanceHistoryService) {}

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetBalanceHistory()
  async handle(@Query() query: GetBalanceHistoryQueryDto): Promise<GetBalanceHistoryResponseDto> {
    return this.service.execute(query);
  }
}
