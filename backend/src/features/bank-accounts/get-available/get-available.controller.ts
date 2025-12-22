import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAvailableBankAccountService } from './get-available.service';
import { GetAvailableBankAccountQueryDto } from './get-available.query.dto';
import { GetAvailableBankAccountResponseDto } from './get-available.response.dto';
import { ApiGetAvailableBankAccount } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetAvailableBankAccountController {
  constructor(private readonly service: GetAvailableBankAccountService) {}

  @Get('available')
  @ApiGetAvailableBankAccount()
  async handle(
    @Query() query: GetAvailableBankAccountQueryDto,
  ): Promise<GetAvailableBankAccountResponseDto> {
    return this.service.execute(query);
  }
}
