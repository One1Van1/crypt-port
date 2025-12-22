import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllShiftsService } from './get-all.service';
import { GetAllShiftsQueryDto } from './get-all.query.dto';
import { GetAllShiftsResponseDto } from './get-all.response.dto';
import { ApiGetAllShifts } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('shifts')
@ApiTags('Shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAllShiftsController {
  constructor(private readonly service: GetAllShiftsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllShifts()
  async handle(@Query() query: GetAllShiftsQueryDto): Promise<GetAllShiftsResponseDto> {
    return this.service.execute(query);
  }
}
