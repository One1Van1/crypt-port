import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetAllTransactionsV2Service } from './get-all-v2.service';
import { GetAllTransactionsV2QueryDto } from './get-all-v2.query.dto';
import { GetAllTransactionsV2ResponseDto } from './get-all-v2.response.dto';
import { ApiGetAllTransactionsV2 } from './openapi.decorator';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAllTransactionsV2Controller {
  constructor(private readonly service: GetAllTransactionsV2Service) {}

  @Get('v2')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllTransactionsV2()
  async handle(@Query() query: GetAllTransactionsV2QueryDto): Promise<GetAllTransactionsV2ResponseDto> {
    return this.service.execute(query);
  }
}
