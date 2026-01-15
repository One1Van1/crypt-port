import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../../common/enums/user.enum';
import { User } from '../../../../entities/user.entity';
import { ApiCreateDebt } from './openapi.decorator';
import { CreateDebtService } from './create.service';
import { CreateDebtRequestDto } from './create.request.dto';
import { CreateDebtResponseDto } from './create.response.dto';

@Controller('admin')
@ApiTags('CreateDebt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreateDebtController {
  constructor(private readonly service: CreateDebtService) {}

  @Post('debt')
  @Roles(UserRole.ADMIN)
  @ApiCreateDebt()
  async handle(
    @Body() dto: CreateDebtRequestDto,
    @CurrentUser() user: User,
  ): Promise<CreateDebtResponseDto> {
    return this.service.execute(dto, user);
  }
}
