import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetWorkingDepositHistoryService } from './get-history.service';
import { GetWorkingDepositHistoryQueryDto } from './get-history.query.dto';
import { GetWorkingDepositHistoryResponseDto } from './get-history.response.dto';
import { ApiGetWorkingDepositHistory } from './openapi.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('working-deposit')
@ApiTags('GetWorkingDepositHistory')
export class GetWorkingDepositHistoryController {
  constructor(private readonly service: GetWorkingDepositHistoryService) {}

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetWorkingDepositHistory()
  async handle(@Query() query: GetWorkingDepositHistoryQueryDto): Promise<GetWorkingDepositHistoryResponseDto> {
    return this.service.execute(query);
  }
}
