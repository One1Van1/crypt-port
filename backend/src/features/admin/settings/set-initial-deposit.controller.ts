import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SetInitialDepositService } from './set-initial-deposit.service';
import { SetInitialDepositRequestDto } from './set-initial-deposit.request.dto';
import { SetInitialDepositResponseDto } from './set-initial-deposit.response.dto';
import { ApiSetInitialDeposit } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('admin/settings')
@ApiTags('Admin Settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SetInitialDepositController {
  constructor(private readonly service: SetInitialDepositService) {}

  @Patch('initial-deposit')
  @Roles(UserRole.ADMIN)
  @ApiSetInitialDeposit()
  async handle(@Body() dto: SetInitialDepositRequestDto): Promise<SetInitialDepositResponseDto> {
    return this.service.execute(dto);
  }
}
