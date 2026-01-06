import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { GetWorkingDepositSectionsLedgerResponseDto } from './get-sections-ledger.response.dto';

export const ApiGetWorkingDepositSectionsLedger = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟣 [ADMIN, TEAMLEAD] Get working deposit sections (Free USDT from ledger)',
    }),
    ApiBearerAuth(),
    ApiRolesAccess(UserRole.ADMIN, UserRole.TEAMLEAD),
    ApiOkResponse({ type: GetWorkingDepositSectionsLedgerResponseDto }),
  );
