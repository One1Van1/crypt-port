import { Controller, Patch, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBankAccountStatusService } from './update-status.service';
import { UpdateBankAccountStatusRequestDto } from './update-status.request.dto';
import { UpdateBankAccountStatusResponseDto } from './update-status.response.dto';
import { ApiUpdateBankAccountStatus } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateBankAccountStatusController {
  constructor(private readonly service: UpdateBankAccountStatusService) {}

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUpdateBankAccountStatus()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankAccountStatusRequestDto,
  ): Promise<UpdateBankAccountStatusResponseDto> {
    return this.service.execute(id, dto);
  }
}
