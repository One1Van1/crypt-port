import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { ApiGetRequisiteV3 } from './openapi.decorator';
import { GetRequisiteV3Service } from './get-requisite-v3.service';
import { GetRequisiteV3ResponseDto } from './get-requisite-v3.response.dto';

@Controller('bank-accounts')
@ApiTags('GetRequisiteV3')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetRequisiteV3Controller {
  constructor(private readonly service: GetRequisiteV3Service) {}

  @Get('requisite-v3')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetRequisiteV3()
  async handle(@CurrentUser() user: User): Promise<GetRequisiteV3ResponseDto> {
    return this.service.execute(user);
  }
}
