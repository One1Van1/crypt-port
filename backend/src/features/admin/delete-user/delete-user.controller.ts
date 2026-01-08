import { Controller, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { AdminDeleteUserService } from './delete-user.service';
import { ApiAdminDeleteUser } from './openapi.decorator';

@Controller('admin/users')
@ApiTags('Admin - Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminDeleteUserController {
  constructor(private readonly service: AdminDeleteUserService) {}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiAdminDeleteUser()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.execute(id);
  }
}
