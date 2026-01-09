import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { ApiGetRequisiteV2 } from './openapi.decorator';
import { GetRequisiteV2Service } from './get-requisite-v2.service';
import { GetRequisiteV2ResponseDto } from './get-requisite-v2.response.dto';

@Controller('bank-accounts')
@ApiTags('GetRequisiteV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetRequisiteV2Controller {
  constructor(private readonly service: GetRequisiteV2Service) {}

  @Get('requisite-v2')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetRequisiteV2()
  async handle(@CurrentUser() user: User): Promise<GetRequisiteV2ResponseDto> {
    return this.service.execute(user);
  }
}
