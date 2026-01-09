import { Controller, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UnfreezeDropNeoBankService } from './unfreeze.service';
import { UnfreezeDropNeoBankResponseDto } from './unfreeze.response.dto';
import { ApiUnfreezeDropNeoBank } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('drop-neo-banks')
@ApiTags('UnfreezeDropNeoBank')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnfreezeDropNeoBankController {
  constructor(private readonly service: UnfreezeDropNeoBankService) {}

  @Patch(':id/unfreeze')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUnfreezeDropNeoBank()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<UnfreezeDropNeoBankResponseDto> {
    return this.service.execute(id, user);
  }
}
