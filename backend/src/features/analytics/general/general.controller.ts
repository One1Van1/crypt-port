import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetGeneralStatsService } from './general.service';
import { GetGeneralStatsResponseDto } from './general.response.dto';
import { ApiGetGeneralStats } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('analytics')
@ApiTags('Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetGeneralStatsController {
  constructor(private readonly service: GetGeneralStatsService) {}

  @Get('general')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetGeneralStats()
  async handle(): Promise<GetGeneralStatsResponseDto> {
    return this.service.execute();
  }
}
