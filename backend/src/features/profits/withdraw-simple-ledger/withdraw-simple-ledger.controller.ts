import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiWithdrawSimpleLedgerProfit } from './openapi.decorator';
import { WithdrawSimpleLedgerProfitRequestDto } from './withdraw-simple-ledger.request.dto';
import { WithdrawSimpleLedgerProfitResponseDto } from './withdraw-simple-ledger.response.dto';
import { WithdrawSimpleLedgerProfitService } from './withdraw-simple-ledger.service';

@Controller('profits')
@ApiTags('WithdrawSimpleLedgerProfit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WithdrawSimpleLedgerProfitController {
  constructor(private readonly service: WithdrawSimpleLedgerProfitService) {}

  @Post('withdraw-simple-ledger')
  @Roles(UserRole.ADMIN)
  @ApiWithdrawSimpleLedgerProfit()
  async handle(
    @Body() dto: WithdrawSimpleLedgerProfitRequestDto,
    @CurrentUser() user: User,
  ): Promise<WithdrawSimpleLedgerProfitResponseDto> {
    return this.service.execute(dto, user);
  }
}
