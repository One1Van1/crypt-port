import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetMyBanksService } from './get-my-banks.service';
import { GetMyBanksResponseDto } from './get-my-banks.response.dto';
import { ApiGetMyBanks } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('transactions')
@ApiTags('GetMyBanks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetMyBanksController {
  constructor(private readonly service: GetMyBanksService) {}

  @Get('my-banks')
  @ApiGetMyBanks()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  async handle(@CurrentUser() user: User): Promise<GetMyBanksResponseDto> {
    return this.service.execute(user);
  }
}
