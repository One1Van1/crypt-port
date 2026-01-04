import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SetExchangeRateService } from './set-rate.service';
import { SetExchangeRateDto } from './set-rate.dto';
import { ExchangeRateResponseDto } from './set-rate.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiSetExchangeRate } from './openapi.decorator';

@Controller('exchange-rates')
@ApiTags('ExchangeRates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SetExchangeRateController {
  constructor(private readonly service: SetExchangeRateService) {}

  @Post('set')
  @Roles(UserRole.ADMIN)
  @ApiSetExchangeRate()
  async handle(
    @Body() dto: SetExchangeRateDto,
    @Request() req,
  ): Promise<ExchangeRateResponseDto> {
    return this.service.execute(dto, req.user.userId);
  }
}
