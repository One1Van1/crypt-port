import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { ApiSearchNeoBanksV3 } from './openapi.decorator';
import { SearchNeoBanksV3QueryDto } from './search-neo-banks-v3.query.dto';
import { SearchNeoBanksV3Service } from './search-neo-banks-v3.service';
import { SearchNeoBanksV3ResponseDto } from './search-neo-banks-v3.response.dto';

@Controller('bank-accounts')
@ApiTags('SearchNeoBanksV3')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SearchNeoBanksV3Controller {
  constructor(private readonly service: SearchNeoBanksV3Service) {}

  @Get('requisite-v3/neo-banks')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiSearchNeoBanksV3()
  async handle(
    @CurrentUser() user: User,
    @Query() query: SearchNeoBanksV3QueryDto,
  ): Promise<SearchNeoBanksV3ResponseDto> {
    return this.service.execute(user, query);
  }
}
