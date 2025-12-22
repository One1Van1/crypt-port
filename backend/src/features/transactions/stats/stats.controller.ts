import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetTransactionsStatsService } from './stats.service';
import { GetTransactionsStatsQueryDto } from './stats.query.dto';
import { GetTransactionsStatsResponseDto } from './stats.response.dto';
import { ApiGetTransactionsStats } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetTransactionsStatsController {
  constructor(private readonly service: GetTransactionsStatsService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetTransactionsStats()
  async handle(@Query() query: GetTransactionsStatsQueryDto): Promise<GetTransactionsStatsResponseDto> {
    return this.service.execute(query);
  }
}
