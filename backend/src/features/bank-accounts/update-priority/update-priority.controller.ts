import { Controller, Patch, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBankAccountPriorityService } from './update-priority.service';
import { UpdateBankAccountPriorityRequestDto } from './update-priority.request.dto';
import { UpdateBankAccountPriorityResponseDto } from './update-priority.response.dto';
import { ApiUpdateBankAccountPriority } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateBankAccountPriorityController {
  constructor(private readonly service: UpdateBankAccountPriorityService) {}

  @Patch(':id/priority')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUpdateBankAccountPriority()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankAccountPriorityRequestDto,
  ): Promise<UpdateBankAccountPriorityResponseDto> {
    return this.service.execute(id, dto);
  }
}
