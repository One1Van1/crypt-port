import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetOperatorBanksService } from './get-operator-banks.service';
import { GetOperatorBanksResponseDto } from './get-operator-banks.response.dto';
import { ApiGetOperatorBanks } from './openapi.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('banks')
@ApiTags('GetOperatorBanks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetOperatorBanksController {
  constructor(private readonly service: GetOperatorBanksService) {}

  @Get('operator/my-banks')
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiGetOperatorBanks()
  async handle(@CurrentUser() user: User): Promise<GetOperatorBanksResponseDto> {
    return this.service.execute(user.id);
  }
}
