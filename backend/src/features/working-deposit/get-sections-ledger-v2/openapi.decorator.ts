import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetWorkingDepositSectionsLedgerV2ResponseDto } from './get-sections-ledger-v2.response.dto';

export const ApiGetWorkingDepositSectionsLedgerV2 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get working deposit sections ledger (v2)' }),
    ApiOkResponse({ type: GetWorkingDepositSectionsLedgerV2ResponseDto }),
  );
