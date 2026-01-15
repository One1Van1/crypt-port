import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ConfirmConversionLedgerV2ResponseDto } from './confirm-conversion-ledger-v2.response.dto';

export const ApiConfirmConversionLedgerV2 = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟣 [ADMIN, TEAMLEAD] Confirm conversion (ledger v2, repays debt first)',
    }),
    ApiOkResponse({ type: ConfirmConversionLedgerV2ResponseDto }),
  );
