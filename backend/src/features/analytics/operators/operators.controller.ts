import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetOperatorsAnalyticsService } from './operators.service';
import { GetOperatorsAnalyticsQueryDto } from './operators.query.dto';
import { GetOperatorsAnalyticsResponseDto } from './operators.response.dto';
import { ApiGetOperatorsAnalytics } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('analytics')
@ApiTags('Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetOperatorsAnalyticsController {
  constructor(private readonly service: GetOperatorsAnalyticsService) {}

  @Get('operators')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetOperatorsAnalytics()
  async handle(@Query() query: GetOperatorsAnalyticsQueryDto): Promise<GetOperatorsAnalyticsResponseDto> {
    return this.service.execute(query);
  }
}
