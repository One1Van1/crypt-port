import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetNeoBankLimitsRemaining } from './openapi.decorator';
import { GetNeoBankLimitsRemainingQueryDto } from './get-limits-remaining.query.dto';
import { GetNeoBankLimitsRemainingResponseDto } from './get-limits-remaining.response.dto';
import { GetNeoBankLimitsRemainingService } from './get-limits-remaining.service';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBanksLimitsRemaining')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetNeoBankLimitsRemainingController {
  constructor(private readonly service: GetNeoBankLimitsRemainingService) {}

  @Get('limits-remaining')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetNeoBankLimitsRemaining()
  async handle(@Query() query: GetNeoBankLimitsRemainingQueryDto): Promise<GetNeoBankLimitsRemainingResponseDto> {
    return this.service.execute(query);
  }
}
