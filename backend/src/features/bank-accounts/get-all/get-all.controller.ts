import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllBankAccountsService } from './get-all.service';
import { GetAllBankAccountsQueryDto } from './get-all.query.dto';
import { GetAllBankAccountsResponseDto } from './get-all.response.dto';
import { ApiGetAllBankAccounts } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetAllBankAccountsController {
  constructor(private readonly service: GetAllBankAccountsService) {}

  @Get()
  @ApiGetAllBankAccounts()
  async handle(@Query() query: GetAllBankAccountsQueryDto): Promise<GetAllBankAccountsResponseDto> {
    return this.service.execute(query);
  }
}
