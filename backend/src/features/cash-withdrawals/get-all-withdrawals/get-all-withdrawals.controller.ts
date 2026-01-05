import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllWithdrawalsService } from './get-all-withdrawals.service';
import { GetAllWithdrawalsResponseDto } from './get-all-withdrawals.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetAllWithdrawals } from './openapi.decorator';

@Controller('cash-withdrawals')
@ApiTags('GetAllWithdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetAllWithdrawalsController {
  constructor(private readonly service: GetAllWithdrawalsService) {}

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllWithdrawals()
  async handle(): Promise<GetAllWithdrawalsResponseDto> {
    return this.service.execute();
  }
}
