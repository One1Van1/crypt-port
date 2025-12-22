import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBankAccountService } from './create.service';
import { CreateBankAccountRequestDto } from './create.request.dto';
import { CreateBankAccountResponseDto } from './create.response.dto';
import { ApiCreateBankAccount } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateBankAccountController {
  constructor(private readonly service: CreateBankAccountService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiCreateBankAccount()
  async handle(@Body() dto: CreateBankAccountRequestDto): Promise<CreateBankAccountResponseDto> {
    return this.service.execute(dto);
  }
}
