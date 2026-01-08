import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetInactiveUsersService } from './get-inactive-users.service';
import { GetInactiveUsersResponseDto } from './get-inactive-users.response.dto';
import { ApiGetInactiveUsers } from './openapi.decorator';

@Controller('admin/users')
@ApiTags('Admin - Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetInactiveUsersController {
  constructor(private readonly service: GetInactiveUsersService) {}

  @Get('inactive')
  @Roles(UserRole.ADMIN)
  @ApiGetInactiveUsers()
  async handle(): Promise<GetInactiveUsersResponseDto> {
    return this.service.execute();
  }
}
