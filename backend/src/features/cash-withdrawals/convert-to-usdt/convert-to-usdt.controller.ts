import { Controller, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConvertToUsdtService } from './convert-to-usdt.service';
import { ConvertToUsdtDto } from './convert-to-usdt.dto';
import { ConvertToUsdtResponseDto } from './convert-to-usdt.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiConvertToUsdt } from './openapi.decorator';

@Controller('cash-withdrawals')
@ApiTags('CashWithdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConvertToUsdtController {
  constructor(private readonly service: ConvertToUsdtService) {}

  @Post(':id/convert-to-usdt')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiConvertToUsdt()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConvertToUsdtDto,
    @Request() req,
  ): Promise<ConvertToUsdtResponseDto> {
    return this.service.execute(id, dto, req.user.userId);
  }
}
