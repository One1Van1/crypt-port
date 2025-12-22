import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBalanceService } from './create.service';
import { CreateBalanceRequestDto } from './create.request.dto';
import { CreateBalanceResponseDto } from './create.response.dto';
import { ApiCreateBalance } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('balances')
@ApiTags('Balances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateBalanceController {
  constructor(private readonly service: CreateBalanceService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreateBalance()
  async handle(@Body() dto: CreateBalanceRequestDto): Promise<CreateBalanceResponseDto> {
    return this.service.execute(dto);
  }
}
