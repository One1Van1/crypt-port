import { Controller, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiConfirmConversionLedgerV2 } from './openapi.decorator';
import { ConfirmConversionLedgerV2Service } from './confirm-conversion-ledger-v2.service';
import { ConfirmConversionLedgerV2ResponseDto } from './confirm-conversion-ledger-v2.response.dto';

@Controller('cash-withdrawals')
@ApiTags('ConfirmConversionLedgerV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConfirmConversionLedgerV2Controller {
  constructor(private readonly service: ConfirmConversionLedgerV2Service) {}

  @Patch('conversions/:id/confirm-ledger-v2')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiConfirmConversionLedgerV2()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<ConfirmConversionLedgerV2ResponseDto> {
    return this.service.execute(id, user);
  }
}
