import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/enums/user.enum';
import { ApiGetDebtOperations } from './openapi.decorator';
import { GetDebtOperationsService } from './get-operations.service';
import { GetDebtOperationsQueryDto } from './get-operations.query.dto';
import { GetDebtOperationsResponseDto } from './get-operations.response.dto';

@Controller('admin')
@ApiTags('GetDebtOperations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetDebtOperationsController {
  constructor(private readonly service: GetDebtOperationsService) {}

  @Get('debt/operations')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetDebtOperations()
  async handle(@Query() query: GetDebtOperationsQueryDto): Promise<GetDebtOperationsResponseDto> {
    return this.service.execute(query);
  }
}
