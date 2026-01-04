import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetHistoryService } from './get-history.service';
import { GetHistoryResponseDto } from './get-history.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetHistory } from './openapi.decorator';

@Controller('exchange-rates')
@ApiTags('ExchangeRates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetHistoryController {
  constructor(private readonly service: GetHistoryService) {}

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetHistory()
  async handle(): Promise<GetHistoryResponseDto> {
    return this.service.execute();
  }
}
