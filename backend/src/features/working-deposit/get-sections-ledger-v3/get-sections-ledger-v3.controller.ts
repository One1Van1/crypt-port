import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetWorkingDepositSectionsLedgerV3 } from './openapi.decorator';
import { GetWorkingDepositSectionsLedgerV3Service } from './get-sections-ledger-v3.service';
import { GetWorkingDepositSectionsLedgerV3ResponseDto } from './get-sections-ledger-v3.response.dto';

@Controller('working-deposit')
@ApiTags('GetWorkingDepositSectionsLedgerV3')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetWorkingDepositSectionsLedgerV3Controller {
  constructor(private readonly service: GetWorkingDepositSectionsLedgerV3Service) {}

  @Get('sections-ledger-v3')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetWorkingDepositSectionsLedgerV3()
  async handle(): Promise<GetWorkingDepositSectionsLedgerV3ResponseDto> {
    return this.service.execute();
  }
}
