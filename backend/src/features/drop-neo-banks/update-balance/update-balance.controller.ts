import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateBalanceService } from './update-balance.service';
import { UpdateBalanceRequestDto } from './update-balance.request.dto';
import { UpdateBalanceResponseDto } from './update-balance.response.dto';
import { ApiUpdateBalance } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drop-neo-banks')
@ApiTags('UpdateBalance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateBalanceController {
  constructor(private readonly service: UpdateBalanceService) {}

  @Patch(':id/balance')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiUpdateBalance()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBalanceRequestDto,
  ): Promise<UpdateBalanceResponseDto> {
    return this.service.execute(id, dto);
  }
}
