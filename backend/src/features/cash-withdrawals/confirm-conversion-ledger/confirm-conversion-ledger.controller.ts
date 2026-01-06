import { Controller, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiConfirmConversionLedger } from './openapi.decorator';
import { ConfirmConversionLedgerService } from './confirm-conversion-ledger.service';
import { ConfirmConversionLedgerResponseDto } from './confirm-conversion-ledger.response.dto';

@Controller('cash-withdrawals')
@ApiTags('ConfirmConversionLedger')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConfirmConversionLedgerController {
  constructor(private readonly service: ConfirmConversionLedgerService) {}

  @Patch('conversions/:id/confirm-ledger')
  @Roles(UserRole.ADMIN)
  @ApiConfirmConversionLedger()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<ConfirmConversionLedgerResponseDto> {
    return this.service.execute(id, user);
  }
}
