import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetWorkingDepositSectionsService } from './get-sections.service';
import { GetWorkingDepositSectionsResponseDto } from './get-sections.response.dto';
import { ApiGetWorkingDepositSections } from './openapi.decorator';

@Controller('working-deposit')
@ApiTags('GetWorkingDepositSections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetWorkingDepositSectionsController {
  constructor(private readonly service: GetWorkingDepositSectionsService) {}

  @Get('sections')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetWorkingDepositSections()
  async handle(): Promise<GetWorkingDepositSectionsResponseDto> {
    return this.service.execute();
  }
}
