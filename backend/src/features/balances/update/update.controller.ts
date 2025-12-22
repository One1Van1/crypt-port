import { Controller, Patch, Param, ParseIntPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBalanceService } from './update.service';
import { UpdateBalanceRequestDto } from './update.request.dto';
import { UpdateBalanceResponseDto } from './update.response.dto';
import { ApiUpdateBalance } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('balances')
@ApiTags('Balances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateBalanceController {
  constructor(private readonly service: UpdateBalanceService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateBalance()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBalanceRequestDto,
  ): Promise<UpdateBalanceResponseDto> {
    return this.service.execute(id, dto);
  }
}
