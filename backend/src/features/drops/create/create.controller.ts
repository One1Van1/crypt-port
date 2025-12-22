import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDropService } from './create.service';
import { CreateDropRequestDto } from './create.request.dto';
import { CreateDropResponseDto } from './create.response.dto';
import { ApiCreateDrop } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drops')
@ApiTags('Drops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateDropController {
  constructor(private readonly service: CreateDropService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiCreateDrop()
  async handle(@Body() dto: CreateDropRequestDto): Promise<CreateDropResponseDto> {
    return this.service.execute(dto);
  }
}
