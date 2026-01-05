import { Controller, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfirmConversionService } from './confirm-conversion.service';
import { ConfirmConversionResponseDto } from './confirm-conversion.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiConfirmConversion } from './openapi.decorator';

@Controller('cash-withdrawals')
@ApiTags('ConfirmConversion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfirmConversionController {
  constructor(private readonly service: ConfirmConversionService) {}

  @Patch('conversions/:id/confirm')
  @Roles(UserRole.ADMIN)
  @ApiConfirmConversion()
  async handle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConfirmConversionResponseDto> {
    return this.service.execute(id);
  }
}
