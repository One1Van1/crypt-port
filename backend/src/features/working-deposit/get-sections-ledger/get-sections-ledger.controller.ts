import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetWorkingDepositSectionsLedger } from './openapi.decorator';
import { GetWorkingDepositSectionsLedgerService } from './get-sections-ledger.service';
import { GetWorkingDepositSectionsLedgerResponseDto } from './get-sections-ledger.response.dto';

@Controller('working-deposit')
@ApiTags('GetWorkingDepositSectionsLedger')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetWorkingDepositSectionsLedgerController {
  constructor(private readonly service: GetWorkingDepositSectionsLedgerService) {}

  @Get('sections-ledger')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetWorkingDepositSectionsLedger()
  async handle(): Promise<GetWorkingDepositSectionsLedgerResponseDto> {
    return this.service.execute();
  }
}
