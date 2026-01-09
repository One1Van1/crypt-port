import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetWorkingDepositSectionsLedgerV2 } from './openapi.decorator';
import { GetWorkingDepositSectionsLedgerV2Service } from './get-sections-ledger-v2.service';
import { GetWorkingDepositSectionsLedgerV2ResponseDto } from './get-sections-ledger-v2.response.dto';

@Controller('working-deposit')
@ApiTags('GetWorkingDepositSectionsLedgerV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetWorkingDepositSectionsLedgerV2Controller {
  constructor(private readonly service: GetWorkingDepositSectionsLedgerV2Service) {}

  @Get('sections-ledger-v2')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetWorkingDepositSectionsLedgerV2()
  async handle(): Promise<GetWorkingDepositSectionsLedgerV2ResponseDto> {
    return this.service.execute();
  }
}
