import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetFreeUsdtLedgerService } from './get-ledger.service';
import { GetFreeUsdtLedgerQueryDto } from './get-ledger.query.dto';
import { GetFreeUsdtLedgerResponseDto } from './get-ledger.response.dto';
import { ApiGetFreeUsdtLedger } from './openapi.decorator';

@Controller('free-usdt')
@ApiTags('GetFreeUsdtLedger')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
class GetFreeUsdtLedgerController {
  constructor(private readonly service: GetFreeUsdtLedgerService) {}

  @Get('ledger')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetFreeUsdtLedger()
  async handle(@Query() query: GetFreeUsdtLedgerQueryDto): Promise<GetFreeUsdtLedgerResponseDto> {
    return this.service.execute(query);
  }
}

export { GetFreeUsdtLedgerController };
