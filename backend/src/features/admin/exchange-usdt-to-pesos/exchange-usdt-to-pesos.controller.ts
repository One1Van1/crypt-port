import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ExchangeUsdtToPesosService } from './exchange-usdt-to-pesos.service';
import { ExchangeUsdtToPesosRequestDto } from './exchange-usdt-to-pesos.request.dto';
import { ExchangeUsdtToPesosResponseDto } from './exchange-usdt-to-pesos.response.dto';
import { ApiExchangeUsdtToPesos } from './openapi.decorator';

@Controller('admin')
@ApiTags('ExchangeUsdtToPesos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExchangeUsdtToPesosController {
  constructor(private readonly service: ExchangeUsdtToPesosService) {}

  @Post('exchange-usdt-to-pesos')
  @Roles(UserRole.ADMIN)
  @ApiExchangeUsdtToPesos()
  async handle(
    @Body() dto: ExchangeUsdtToPesosRequestDto,
    @CurrentUser() user: User,
  ): Promise<ExchangeUsdtToPesosResponseDto> {
    return this.service.execute(dto, user);
  }
}
