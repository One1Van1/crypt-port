import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleService } from './update-user-role.service';
import { UpdateUserRoleRequestDto } from './update-user-role.request.dto';
import { UpdateUserRoleResponseDto } from './update-user-role.response.dto';
import { ApiUpdateUserRole } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

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
  ): Promise<UpdateUserRoleResponseDto> {
    return this.service.execute(id, dto);
  }
}
