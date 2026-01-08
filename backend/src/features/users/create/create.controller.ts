import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CreateUserService } from './create.service';
import { CreateUserRequestDto } from './create.request.dto';
import { CreateUserResponseDto } from './create.response.dto';
import { ApiCreateUser } from './openapi.decorator';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateUserController {
  constructor(private readonly service: CreateUserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateUser()
  async handle(@Body() dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    return this.service.execute(dto);
  }
}
