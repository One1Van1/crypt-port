import { Controller, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeleteUserService } from './delete.service';
import { ApiDeleteUser } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeleteUserController {
  constructor(private readonly service: DeleteUserService) {}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteUser()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.execute(id);
  }
}
