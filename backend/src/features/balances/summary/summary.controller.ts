import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetBalancesSummaryService } from './summary.service';
import { GetBalancesSummaryResponseDto } from './summary.response.dto';
import { ApiGetBalancesSummary } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('balances')
@ApiTags('Balances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetBalancesSummaryController {
  constructor(private readonly service: GetBalancesSummaryService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetBalancesSummary()
  async handle(): Promise<GetBalancesSummaryResponseDto> {
    return this.service.execute();
  }
}
