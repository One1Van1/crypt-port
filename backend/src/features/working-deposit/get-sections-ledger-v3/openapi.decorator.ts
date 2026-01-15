import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetWorkingDepositSectionsLedgerV3ResponseDto } from './get-sections-ledger-v3.response.dto';

export const ApiGetWorkingDepositSectionsLedgerV3 = () =>
  applyDecorators(
    ApiOperation({ summary: '🟣 [ADMIN, TEAMLEAD] Get working deposit sections ledger (v3, with debt)' }),
    ApiOkResponse({ type: GetWorkingDepositSectionsLedgerV3ResponseDto }),
  );
