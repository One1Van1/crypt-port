import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetPesosAccountsDetailsV1 } from './openapi.decorator';
import { GetPesosAccountsDetailsV1QueryDto } from './get-pesos-accounts-details-v1.query.dto';
import { GetPesosAccountsDetailsV1ResponseDto } from './get-pesos-accounts-details-v1.response.dto';
import { GetPesosAccountsDetailsV1Service } from './get-pesos-accounts-details-v1.service';

@Controller('working-deposit')
@ApiTags('GetPesosAccountsDetailsV1')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetPesosAccountsDetailsV1Controller {
  constructor(private readonly service: GetPesosAccountsDetailsV1Service) {}

  @Get('pesos-accounts-details-v1')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetPesosAccountsDetailsV1()
  async handle(@Query() query: GetPesosAccountsDetailsV1QueryDto): Promise<GetPesosAccountsDetailsV1ResponseDto> {
    return this.service.execute(query);
  }
}
