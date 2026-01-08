import { Body, Controller, Param, ParseIntPipe, Patch, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { AdminUpdateUserService } from './update-user.service';
import { AdminUpdateUserRequestDto } from './update-user.request.dto';
import { AdminUpdateUserResponseDto } from './update-user.response.dto';
import { ApiAdminUpdateUser } from './openapi.decorator';

@Controller('admin/users')
@ApiTags('Admin - Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminUpdateUserController {
  constructor(private readonly service: AdminUpdateUserService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiAdminUpdateUser()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserRequestDto,
    @CurrentUser() currentUser: User,
  ): Promise<AdminUpdateUserResponseDto> {
    if (currentUser?.id === id && dto.role) {
      throw new ForbiddenException('You cannot change your own role');
    }
    return this.service.execute(id, dto);
  }
}
