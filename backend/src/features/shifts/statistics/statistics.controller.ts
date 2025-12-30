import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetShiftsStatisticsService } from './statistics.service';
import { GetShiftsStatisticsQueryDto } from './statistics.query.dto';
import { GetShiftsStatisticsResponseDto } from './statistics.response.dto';
import { ApiGetShiftsStatistics } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('shifts')
@ApiTags('Shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetShiftsStatisticsController {
  constructor(private readonly service: GetShiftsStatisticsService) {}

  @Get('statistics')
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiGetShiftsStatistics()
  async handle(@Query() query: GetShiftsStatisticsQueryDto): Promise<GetShiftsStatisticsResponseDto> {
    return this.service.execute(query);
  }
}
