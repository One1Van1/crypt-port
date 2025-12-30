import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAvailableBankAccountService } from './get-available.service';
import { GetAvailableBankAccountQueryDto } from './get-available.query.dto';
import { GetAvailableBankAccountResponseDto } from './get-available.response.dto';
import { ApiGetAvailableBankAccount } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAvailableBankAccountController {
  constructor(private readonly service: GetAvailableBankAccountService) {}

  @Get('available')
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiGetAvailableBankAccount()
  async handle(
    @Query() query: GetAvailableBankAccountQueryDto,
  ): Promise<GetAvailableBankAccountResponseDto> {
    return this.service.execute(query);
  }
}
