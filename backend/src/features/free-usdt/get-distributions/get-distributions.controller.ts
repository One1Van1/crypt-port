import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetFreeUsdtDistributions } from './openapi.decorator';
import { GetFreeUsdtDistributionsQueryDto } from './get-distributions.query.dto';
import { GetFreeUsdtDistributionsResponseDto } from './get-distributions.response.dto';
import { GetFreeUsdtDistributionsService } from './get-distributions.service';

@Controller('free-usdt')
@ApiTags('GetFreeUsdtDistributions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetFreeUsdtDistributionsController {
  constructor(private readonly service: GetFreeUsdtDistributionsService) {}

  @Get('distributions')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetFreeUsdtDistributions()
  async handle(
    @Query() query: GetFreeUsdtDistributionsQueryDto,
  ): Promise<GetFreeUsdtDistributionsResponseDto> {
    return this.service.execute(query);
  }
}
