import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/enums/user.enum';
import { ApiGetCurrentDebt } from './openapi.decorator';
import { GetCurrentDebtService } from './get-current.service';
import { GetCurrentDebtResponseDto } from './get-current.response.dto';

@Controller('admin')
@ApiTags('GetCurrentDebt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetCurrentDebtController {
  constructor(private readonly service: GetCurrentDebtService) {}

  @Get('debt')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetCurrentDebt()
  async handle(): Promise<GetCurrentDebtResponseDto> {
    return this.service.execute();
  }
}
