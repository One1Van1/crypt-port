import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiMintFreeUsdt } from './openapi.decorator';
import { MintFreeUsdtRequestDto } from './mint.request.dto';
import { MintFreeUsdtResponseDto } from './mint.response.dto';
import { MintFreeUsdtService } from './mint.service';

@Controller('free-usdt')
@ApiTags('MintFreeUsdt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MintFreeUsdtController {
  constructor(private readonly service: MintFreeUsdtService) {}

  @Post('mint')
  @Roles(UserRole.ADMIN)
  @ApiMintFreeUsdt()
  async handle(
    @Body() dto: MintFreeUsdtRequestDto,
    @CurrentUser() user: User,
  ): Promise<MintFreeUsdtResponseDto> {
    return this.service.execute(dto, user);
  }
}
