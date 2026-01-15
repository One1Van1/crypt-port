import { Body, Controller, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../../common/enums/user.enum';
import { User } from '../../../../entities/user.entity';
import { ApiUpdateDebt } from './openapi.decorator';
import { UpdateDebtService } from './update.service';
import { UpdateDebtRequestDto } from './update.request.dto';
import { UpdateDebtResponseDto } from './update.response.dto';

@Controller('admin')
@ApiTags('UpdateDebt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateDebtController {
  constructor(private readonly service: UpdateDebtService) {}

  @Patch('debt/:id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateDebt()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDebtRequestDto,
    @CurrentUser() user: User,
  ): Promise<UpdateDebtResponseDto> {
    return this.service.execute(id, dto, user);
  }
}
