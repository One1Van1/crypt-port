import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleService } from './update-user-role.service';
import { UpdateUserRoleRequestDto } from './update-user-role.request.dto';
import { UpdateUserRoleResponseDto } from './update-user-role.response.dto';
import { ApiUpdateUserRole } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('admin/users')
@ApiTags('Admin - User Management')
export class UpdateUserRoleController {
  constructor(private readonly service: UpdateUserRoleService) {}

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiUpdateUserRole()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleRequestDto,
    @CurrentUser() currentUser: User,
  ): Promise<UpdateUserRoleResponseDto> {
    if (currentUser?.id === id) {
      throw new ForbiddenException('You cannot change your own role');
    }
    return this.service.execute(id, dto);
  }
}
