import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateExchangeRateService } from './update-rate.service';
import { UpdateExchangeRateRequestDto } from './update-rate.request.dto';
import { UpdateExchangeRateResponseDto } from './update-rate.response.dto';
import { ApiUpdateExchangeRate } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('platforms')
@ApiTags('UpdateExchangeRate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateExchangeRateController {
  constructor(private readonly service: UpdateExchangeRateService) {}

  @Patch(':id/rate')
  @Roles(UserRole.ADMIN)
  @ApiUpdateExchangeRate()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExchangeRateRequestDto,
  ): Promise<UpdateExchangeRateResponseDto> {
    return this.service.execute(id, dto);
  }
}
