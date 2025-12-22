import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateBankStatusService } from './update-status.service';
import { UpdateBankStatusRequestDto } from './update-status.request.dto';
import { UpdateBankStatusResponseDto } from './update-status.response.dto';
import { ApiUpdateBankStatus } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('banks')
@ApiTags('Banks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateBankStatusController {
  constructor(private readonly service: UpdateBankStatusService) {}

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiUpdateBankStatus()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBankStatusRequestDto,
  ): Promise<UpdateBankStatusResponseDto> {
    return this.service.execute(id, dto);
  }
}
