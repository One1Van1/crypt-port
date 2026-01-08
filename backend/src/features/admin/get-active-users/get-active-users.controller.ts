import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetActiveUsersService } from './get-active-users.service';
import { GetActiveUsersResponseDto } from './get-active-users.response.dto';
import { ApiGetActiveUsers } from './openapi.decorator';

@Controller('admin/users')
@ApiTags('Admin - Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetActiveUsersController {
  constructor(private readonly service: GetActiveUsersService) {}

  @Get('active')
  @Roles(UserRole.ADMIN)
  @ApiGetActiveUsers()
  async handle(): Promise<GetActiveUsersResponseDto> {
    return this.service.execute();
  }
}
