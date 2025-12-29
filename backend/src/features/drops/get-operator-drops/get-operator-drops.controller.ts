import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetOperatorDropsService } from './get-operator-drops.service';
import { GetOperatorDropsResponseDto } from './get-operator-drops.response.dto';
import { ApiGetOperatorDrops } from './openapi.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drops')
@ApiTags('GetOperatorDrops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetOperatorDropsController {
  constructor(private readonly service: GetOperatorDropsService) {}

  @Get('operator/my-drops')
  @Roles(UserRole.OPERATOR)
  @ApiGetOperatorDrops()
  async handle(@CurrentUser() user: User): Promise<GetOperatorDropsResponseDto> {
    return this.service.execute(user.id);
  }
}
