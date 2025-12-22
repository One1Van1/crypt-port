import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllBalancesService } from './get-all.service';
import { GetAllBalancesQueryDto } from './get-all.query.dto';
import { GetAllBalancesResponseDto } from './get-all.response.dto';
import { ApiGetAllBalances } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('balances')
@ApiTags('Balances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAllBalancesController {
  constructor(private readonly service: GetAllBalancesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllBalances()
  async handle(@Query() query: GetAllBalancesQueryDto): Promise<GetAllBalancesResponseDto> {
    return this.service.execute(query);
  }
}
