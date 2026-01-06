import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetPlatformExchangesService } from './get-exchanges.service';
import { GetPlatformExchangesQueryDto } from './get-exchanges.query.dto';
import { GetPlatformExchangesResponseDto } from './get-exchanges.response.dto';
import { ApiGetPlatformExchanges } from './openapi.decorator';

@Controller('platforms')
@ApiTags('GetPlatformExchanges')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetPlatformExchangesController {
  constructor(private readonly service: GetPlatformExchangesService) {}

  @Get('exchanges')
  @Roles(UserRole.ADMIN)
  @ApiGetPlatformExchanges()
  async handle(@Query() query: GetPlatformExchangesQueryDto): Promise<GetPlatformExchangesResponseDto> {
    return this.service.execute(query);
  }
}
