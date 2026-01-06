import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiDistributeFreeUsdt } from './openapi.decorator';
import { DistributeFreeUsdtRequestDto } from './distribute.request.dto';
import { DistributeFreeUsdtResponseDto } from './distribute.response.dto';
import { DistributeFreeUsdtService } from './distribute.service';

@Controller('free-usdt')
@ApiTags('DistributeFreeUsdt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DistributeFreeUsdtController {
  constructor(private readonly service: DistributeFreeUsdtService) {}

  @Post('distribute')
  @Roles(UserRole.ADMIN)
  @ApiDistributeFreeUsdt()
  async handle(
    @Body() dto: DistributeFreeUsdtRequestDto,
    @CurrentUser() user: User,
  ): Promise<DistributeFreeUsdtResponseDto> {
    return this.service.execute(dto, user);
  }
}
