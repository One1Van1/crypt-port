import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllUsersService } from './get-all.service';
import { GetAllUsersQueryDto } from './get-all.query.dto';
import { GetAllUsersResponseDto } from './get-all.response.dto';
import { ApiGetAllUsers } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAllUsersController {
  constructor(private readonly service: GetAllUsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllUsers()
  async handle(@Query() query: GetAllUsersQueryDto): Promise<GetAllUsersResponseDto> {
    return this.service.execute(query);
  }
}
