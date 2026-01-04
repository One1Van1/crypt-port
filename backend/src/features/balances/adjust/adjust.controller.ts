import { Controller, Patch, Param, ParseIntPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdjustBalanceService } from './adjust.service';
import { AdjustBalanceRequestDto } from './adjust.request.dto';
import { AdjustBalanceResponseDto } from './adjust.response.dto';
import { ApiAdjustBalance } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('balances')
@ApiTags('Balances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdjustBalanceController {
  constructor(private readonly service: AdjustBalanceService) {}

  @Patch(':id/adjust')
  @Roles(UserRole.ADMIN)
  @ApiAdjustBalance()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustBalanceRequestDto,
  ): Promise<AdjustBalanceResponseDto> {
    return this.service.execute(id, dto);
  }
}
