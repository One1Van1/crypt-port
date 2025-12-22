import { Controller, Patch, Param, ParseUUIDPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateTransactionStatusService } from './update-status.service';
import { UpdateTransactionStatusRequestDto } from './update-status.request.dto';
import { UpdateTransactionStatusResponseDto } from './update-status.response.dto';
import { ApiUpdateTransactionStatus } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateTransactionStatusController {
  constructor(private readonly service: UpdateTransactionStatusService) {}

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD, UserRole.OPERATOR)
  @ApiUpdateTransactionStatus()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionStatusRequestDto,
  ): Promise<UpdateTransactionStatusResponseDto> {
    return this.service.execute(id, dto);
  }
}
