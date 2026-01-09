import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiWithdrawSimpleLedgerV2Profit } from './openapi.decorator';
import { WithdrawSimpleLedgerV2ProfitRequestDto } from './withdraw-simple-ledger-v2.request.dto';
import { WithdrawSimpleLedgerV2ProfitResponseDto } from './withdraw-simple-ledger-v2.response.dto';
import { WithdrawSimpleLedgerV2ProfitService } from './withdraw-simple-ledger-v2.service';

@Controller('profits')
@ApiTags('WithdrawSimpleLedgerProfitV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WithdrawSimpleLedgerV2ProfitController {
  constructor(private readonly service: WithdrawSimpleLedgerV2ProfitService) {}

  @Post('withdraw-simple-ledger-v2')
  @Roles(UserRole.ADMIN)
  @ApiWithdrawSimpleLedgerV2Profit()
  async handle(
    @Body() dto: WithdrawSimpleLedgerV2ProfitRequestDto,
    @CurrentUser() user: User,
  ): Promise<WithdrawSimpleLedgerV2ProfitResponseDto> {
    return this.service.execute(dto, user);
  }
}
