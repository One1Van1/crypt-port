import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBankAccountService } from './update.service';
import { UpdateBankAccountRequestDto } from './update.request.dto';
import { UpdateBankAccountResponseDto } from './update.response.dto';
import { ApiUpdateBankAccount } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateBankAccountController {
  constructor(private readonly service: UpdateBankAccountService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUpdateBankAccount()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBankAccountRequestDto,
  ): Promise<UpdateBankAccountResponseDto> {
    return this.service.execute(id, dto);
  }
}
