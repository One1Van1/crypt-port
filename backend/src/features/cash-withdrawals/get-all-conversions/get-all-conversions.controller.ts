import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllConversionsService } from './get-all-conversions.service';
import { GetAllConversionsResponseDto } from './get-all-conversions.response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetAllConversions } from './openapi.decorator';

@Controller('cash-withdrawals')
@ApiTags('GetAllConversions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetAllConversionsController {
  constructor(private readonly service: GetAllConversionsService) {}

  @Get('conversions')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllConversions()
  async handle(): Promise<GetAllConversionsResponseDto> {
    return this.service.execute();
  }
}
