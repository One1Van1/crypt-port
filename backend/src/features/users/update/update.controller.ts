import { Controller, Patch, Param, ParseUUIDPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserService } from './update.service';
import { UpdateUserRequestDto } from './update.request.dto';
import { UpdateUserResponseDto } from './update.response.dto';
import { ApiUpdateUser } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateUserController {
  constructor(private readonly service: UpdateUserService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateUser()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    return this.service.execute(id, dto);
  }
}
