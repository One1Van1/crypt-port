import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetDropNeoBankFreezeHistoryService } from './get-freeze-history.service';
import { GetDropNeoBankFreezeHistoryQueryDto } from './get-freeze-history.query.dto';
import { GetDropNeoBankFreezeHistoryResponseDto } from './get-freeze-history.response.dto';
import { ApiGetDropNeoBankFreezeHistory } from './openapi.decorator';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBankFreezeHistory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetDropNeoBankFreezeHistoryController {
  constructor(private readonly service: GetDropNeoBankFreezeHistoryService) {}

  @Get('freeze-history')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetDropNeoBankFreezeHistory()
  async handle(@Query() query: GetDropNeoBankFreezeHistoryQueryDto): Promise<GetDropNeoBankFreezeHistoryResponseDto> {
    return this.service.execute(query);
  }
}
