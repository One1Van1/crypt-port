import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetBankAccountByIdService } from './get-by-id.service';
import { GetBankAccountByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetBankAccountById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetBankAccountByIdController {
  constructor(private readonly service: GetBankAccountByIdService) {}

  @Get(':id')
  @ApiGetBankAccountById()
  async handle(@Param('id', ParseUUIDPipe) id: string): Promise<GetBankAccountByIdResponseDto> {
    return this.service.execute(id);
  }
}
