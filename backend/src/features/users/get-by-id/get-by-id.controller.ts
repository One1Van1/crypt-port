import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetUserByIdService } from './get-by-id.service';
import { GetUserByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetUserById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetUserByIdController {
  constructor(private readonly service: GetUserByIdService) {}

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetUserById()
  async handle(@Param('id', ParseUUIDPipe) id: string): Promise<GetUserByIdResponseDto> {
    return this.service.execute(id);
  }
}
