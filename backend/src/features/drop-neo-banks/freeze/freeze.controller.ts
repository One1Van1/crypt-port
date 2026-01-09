import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FreezeDropNeoBankService } from './freeze.service';
import { FreezeDropNeoBankRequestDto } from './freeze.request.dto';
import { FreezeDropNeoBankResponseDto } from './freeze.response.dto';
import { ApiFreezeDropNeoBank } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('drop-neo-banks')
@ApiTags('FreezeDropNeoBank')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FreezeDropNeoBankController {
  constructor(private readonly service: FreezeDropNeoBankService) {}

  @Patch(':id/freeze')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiFreezeDropNeoBank()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FreezeDropNeoBankRequestDto,
    @CurrentUser() user: User,
  ): Promise<FreezeDropNeoBankResponseDto> {
    return this.service.execute(id, dto, user);
  }
}
