import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetProfitHistoryService } from './get-history.service';
import { GetProfitHistoryResponseDto } from './get-history.response.dto';
import { ApiGetProfitHistory } from './openapi.decorator';

@Controller('profits')
@ApiTags('GetProfitHistory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetProfitHistoryController {
  constructor(private readonly service: GetProfitHistoryService) {}

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetProfitHistory()
  async handle(): Promise<GetProfitHistoryResponseDto> {
    return this.service.execute();
  }
}
