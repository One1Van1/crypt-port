import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllDropsService } from './get-all.service';
import { GetAllDropsQueryDto } from './get-all.query.dto';
import { GetAllDropsResponseDto } from './get-all.response.dto';
import { ApiGetAllDrops } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drops')
@ApiTags('Drops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAllDropsController {
  constructor(private readonly service: GetAllDropsService) {}

  @Get()
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiGetAllDrops()
  async handle(@Query() query: GetAllDropsQueryDto): Promise<GetAllDropsResponseDto> {
    return this.service.execute(query);
  }
}
